const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5001;

// middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esabfel.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const appointmentCollection = client
      .db("doctorDB")
      .collection("appointments");
    const userCollection = client.db("doctorDB").collection("users");
    const doctorCollection = client.db("doctorDB").collection("doctors");
    // await client.connect();

    // appointments API

    app.post("/appointments", async (req, res) => {
      const apppointment = req.body;
      const result = await appointmentCollection.insertOne(apppointment);
      res.send(result);
    });

    // users API

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/get-users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.delete("/delete-user/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/update-user/:id", async (req, res) => {
      const user = req.body;
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const updateUser = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateUser);
      res.send(result);
    });

    // admin API

    app.get("/user/admin/:email", async (req, res) => {
      const { email } = req.params;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send(admin);
    });

    // doctors API

    app.post("/add-doctor", async (req, res) => {
      const doctor = req.body;
      const result = await doctorCollection.insertOne(doctor);
      res.send(result);
    });

    app.get("/get-doctors", async (req, res) => {
      const result = await doctorCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("doc house is running well!");
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
