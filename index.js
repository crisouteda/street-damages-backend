var AWS = require("aws-sdk");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

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

app.post("/insert", async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
    Item: { ...req.body, date: Math.floor(new Date().getTime()) },
  };
  console.log(params);
  try {
    await dynamoClient.put(params).promise();
    res.send("insert data");
  } catch (err) {
    console.log(err);
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000...");
});
