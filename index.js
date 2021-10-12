import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import Kafka from "node-rdkafka";
import eventType from "./eventType.js";
const app = express();
app.use(express.json());
app.use(cors());

const stream = Kafka.Producer.createWriteStream(
  {
    "metadata.broker.list": "localhost:9092",
  },
  {},
  {
    topic: "damage",
  }
);

stream.on("error", (err) => {
  console.error("Error in our kafka stream");
  console.error(err);
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "street-damage";
const USERS_TABLE_NAME = "users-street-damage";

app.get("/read", async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
  };
  try {
    const storagedDamages = await dynamoClient.scan(params).promise();
    res.send(storagedDamages);
  } catch (err) {
    console.log(err);
  }
});

app.post("/insertUser", async (req, res) => {
  const params = {
    TableName: USERS_TABLE_NAME,
    Item,
  };
  try {
    await dynamoClient.put(params).promise();
    res.send("insert data");
  } catch (err) {
    console.log(err);
  }
});

app.post("/insertDamage", async (req, res) => {
  const Item = { ...req.body, date: Math.floor(new Date().getTime()) };
  const params = {
    TableName: TABLE_NAME,
    Item,
  };
  console.log(params);
  try {
    await dynamoClient.put(params).promise();
    res.send("insert data");
    const success = stream.write(eventType.toBuffer(Item));
    if (success) {
      console.log(`message queued (${JSON.stringify(Item)})`);
    } else {
      console.log("Too many messages in the queue already..");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000...");
});
