// require
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');

// config
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fi65pdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // all collections
    const database = client.db("luxury-pen");
    const penCollection = database.collection("pen");

    // all pen related api
    app.get('/pens', async (req, res) => {
      const result = await penCollection.find().toArray();
      res.send(result);
    })

        // Get all books data from DB for pagination
        app.get("/all-pens", async (req, res) => {
          const size = parseInt(req.query.size);
          const page = parseInt(req.query.page) - 1;
          const filter = req.query.filter;
          const sort = req.query.sort;
          let query = {};
          if (filter) query = { category: filter };
          let options = {};
          if (sort) options = { sort: { rating: sort === "ascending" ? 1 : -1 } };
          const result = await penCollection
            .find(query, options)
            .skip(page * size)
            .limit(size)
            .toArray();
          res.send(result);
        });
    
        // Get all books data count from DB
        app.get("/pens-count", async (req, res) => {
          const filter = req.query.filter;
          let query = {};
          if (filter) query = { category: filter };
          const count = await penCollection.countDocuments(query);
          res.send({ count });
        });




    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Job task is running.......");
  });

  app.listen(port, () => {
    console.log(`Server running on the port, ${port}`);
  });
