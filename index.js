const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tg0ohza.mongodb.net/?retryWrites=true&w=majority `;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const allCollegesCollection = client
      .db("CollegeDB")
      .collection("collegesCollection");

    const candidatesCollection = client
      .db("CollegeDB")
      .collection("candidates");
    const reviewCollection = client.db("CollegeDB").collection("reviews");
    const usersCollection = client.db("CollegeDB").collection("users");

    app.get("/allColleges", async (req, res) => {
      let query = {};

      if (req.query?.collegeName) {
        query.collegeName = req.query.collegeName;
      }
      const cursor = allCollegesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allColleges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allCollegesCollection.findOne(query);
      res.send(result);
    });

    app.get("/allColleges/nameOfCollege/:collegeName", async (req, res) => {
      const collegeName = req.params.collegeName;
      const query = { collegeName: collegeName };
      const result = await allCollegesCollection.findOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const exist = await usersCollection.findOne(query);
      if (exist) {
        return res.send({ message: "already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(data);
      res.send(result);
    });

    app.patch("/addCandidateInfoAsUserInfo/:email", async (req, res) => {
      const item = req.body;
      const email = req.params.email;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          photoURL: item.photoURL,
          name: item.name,
          email: item.email,
          address: item.address,
          number: item.number,
          subject: item.subject,
          birthDate: item.birthDate,
          collegeName: item.collegeName,
          collegeImage: item.collegeImage,
          admissionDate: item.admissionDate,
          admissionProcess: item.admissionProcess,
          events: item.events,
          researchHistory: item.researchHistory,
          sports: item.sports,
          sportsCategories: item.sportsCategories,
          researchWorks: item.researchWorks,
          collegeRating: item.collegeRating,
          numberOfResearch: item.numberOfResearch,
        },
      };

      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/resetPassword/:email", async (req, res) => {
      const item = req.body;
      const email = req.params.email;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          password: item.password,
        },
      };

      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.get("/users/email/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      if (email === "hello@hello.com") {
        console.log("invalid email");
        return res.status(400).send({ message: "Invalid email." });
      }
      console.log(query);
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/addCandidateInfo", async (req, res) => {
      const candidateInfo = req.body;
      const query = { email: candidateInfo.email };
      const exist = await candidatesCollection.findOne(query);
      if (exist) {
        return res.send({ message: "already exists", insertedId: null });
      }
      const result = await candidatesCollection.insertOne(candidateInfo);
      res.send(result);
    });

    app.get("/candidatesInfo", async (req, res) => {
      const cursor = candidatesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/candidateInfoEmail", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query.email = req.query.email;
      }

      if (req.query?.collegeName) {
        query.collegeName = req.query.collegeName;
      }
      const cursor = candidatesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/allReviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // before

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("college booking server running");
});

app.listen(port, () => {
  console.log(`current server is running on port: ${port}`);
});
