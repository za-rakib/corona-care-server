const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const port = 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zqlov.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());
app.use(express.static("doctors"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello Corona Care");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client
    .db("corona-care")
    .collection("appointment");
  const doctorsCollection = client.db("corona-care").collection("doctors");

  app.post("/appointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.acknowledged > 0);
    });
  });

  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, result) => {
      res.send(result);
    });
  });

  app.post("/appointmentByDate", (req, res) => {
    const date = req.body.mySelectedDate;
    const email = req.body.email;
    console.log("date and email",date, email);
    doctorsCollection.find({ email: email }).toArray((err, doctors) => {
      const filter = { date: date, email };
      // console.log(doctors.length);
      if (doctors.length === 0) {
        appointmentCollection.find(filter).toArray((err, documents) => {
          // console.log(documents);
          res.send(documents);
        });
      } else {
        appointmentCollection.find({ date: date }).toArray((err, documents) => {
          // console.log(documents);
          res.send(documents);
        });
      }
    });
  });

  app.post("/isDoctor", (req, res) => {
    const email = req.body.email;
    console.log("context", email)
    doctorsCollection.find({ email: email })
    .toArray((err, doctors) => {
      console.log(doctors.length)
      res.send(doctors.length>0);
    });
  });

  app.post("/addADoctor", (req, res) => {
    const newEvent = req.body;
    console.log("New event", newEvent);
    doctorsCollection.insertOne(newEvent).then((result) => {
      console.log("inserted Count", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });

  app.get("/doctors", (req, res) => {
    doctorsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.listen(process.env.PORT || port);
