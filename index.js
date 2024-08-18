// require
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

// config
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://job-task-ass-10.web.app",
    "https://job-task-ass-10.firebaseapp.com",
  ]
}
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fi65pdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // all collections
    const database = client.db("luxury-pen");
    const penCollection = database.collection("pens");

    // Get all books data from DB for pagination
    app.get("/all_pens", async (req, res) => {
      try {
        // get query parameters
        const {
          page = 1,
          limit = 6,
          brand,
          category,
          price,
          date,
          sortPrice,
          search
        } = req.query;

        const skipIndex = (parseInt(page) - 1) * parseInt(limit);

        // query object
        const query = {};
        if (brand) query.brand = brand;
        if (category) query.category = category;
        if (price) {
          const [minPrice, maxPrice] = price.split('-').map(Number);
          query.price = { $gte: minPrice, $lte: maxPrice };
        }
        if (search) query.name = { $regex: search, $options: 'i' };

        // sort object
        const sort = {};
        if (date) sort.createdAt = date === 'ascending' ? 1 : -1;
        if (sortPrice) sort.price = sortPrice === 'ascending' ? 1 : -1;

        // 
        const totalProducts = await penCollection.countDocuments();

        // fetch data from the collection
        const result = await penCollection
          .find(query)
          .sort(sort)
          .skip(skipIndex)
          .limit(parseInt(limit))
          .toArray();

        // get the total count of documents
        const totalDocuments = await penCollection.countDocuments(query);

        // send response
        res.send({
          page: parseInt(page),
          totalPages: Math.ceil(totalDocuments / parseInt(limit)),
          totalDocuments,
          totalProducts,
          pens: result,
        });
      } catch (error) {
        console.error("Error fetching pens:", error);
        res.status(500).send({ message: "Error fetching pens" });
      }
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
