import Kafka from "node-rdkafka";
import eventType from "../eventType.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const consumer = new Kafka.KafkaConsumer(
  {
    "group.id": "tfm-kafka",
    "metadata.broker.list": "localhost:9092",
  },
  {}
);
consumer.connect();

async function main(damage, geolocation, date) {
  console.log("hola", { date, damage, geolocation });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "street.damage.team@gmail.com", // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Cristina" <street.damage.team@gmail.com>', // sender address
    to: "<cristina.outeda.rua@gmail.com>", // list of receivers
    subject: "Notification", // Subject line
    text: `Hello world? damage: ${damage}, geolocation: ${geolocation.altitude}, ${geolocation}`, // plain text body
    html: `<div><b>Hello world?</b><b> damage: ${damage}, geolocation: ${geolocation}</b></div>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

consumer
  .on("ready", () => {
    console.log("consumer ready..");
    consumer.subscribe(["damage"]);
    consumer.consume();
  })
  .on("data", function (data) {
    console.log(`received message: ${eventType.fromBuffer(data.value)}`);
    const { damage, geolocation, date } = eventType.fromBuffer(data.value);
    console.log({ damage, geolocation, date });
    main(damage, geolocation, date).catch(console.error);
  });
