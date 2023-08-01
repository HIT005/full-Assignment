const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cors());
const port = process.env.PORT || 5000;

mongoose
  .connect("mongodb://localhost:27017/heleverse-data", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database.");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
const dataSchema = new mongoose.Schema({
  //   _id: String,
  id: Number,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  avatar: String,
  domain: String,
  available: Boolean,
});

const Data = mongoose.model("Data", dataSchema);

app.get("/", async (req, res) => {
  try {
    const data = await Data.find();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to load data " });
  }
  // res.send("Hello, World!");
});

app.post("/createdata", async (req, res) => {
  try {
    let data = new Data(req.body);
    let dataresult = await data.save();
    res.json({ dataresult });
    //console.warn(dataresult)
  } catch (error) {
    res.status(500).json({ error: "Failed to create data " });
  }
  // res.send('Hello data')
});

app.delete("/deletedata/:_id", async (req, res) => {
  try {
    let data = await Data.deleteOne(req.params);
    res.json({ data });
    // console.warn(data, "data delete succesfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to reach data " });
  }
  //   res.send(" hello delete ");
});

app.put("/updatedata/:id", async (req, res) => {
  try {
    let data = await Data.updateOne({ _id: req.params.id }, { $set: req.body });
    res.json({ data });
    // console.warn(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to update data " });
  }
  //   res.send("hello update");
});

app.get("/data/:id", async (req, res) => {
  try {
    const data = await Data.findOne({_id:req.params.id});
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to load data " });
  }
  // res.send("Hello, World!");
});

app.search("/datasearch/:key", async (req, res) => {
  try {
    let data = await Data.find({
      $or: [{ first_name: { $regex: req.params.key } }],
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to search data " });
  }
});

app.get("/get/data", async (req, res) => {
  // res.send('hello')
  const page = parseInt(req.query.page) || 1;
  const limit = 20; // Change the limit to 20 for 20 items per page

  try {
    // Get the total count of documents in the collection
    const total = await Data.countDocuments();

    // Calculate the startIndex and endIndex for pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Query the database to retrieve the paginated data
    const result = await Data.find().skip(startIndex).limit(limit);

    // Create a response object with the paginated results and additional info
    const response = {
      data: result,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    };

    res.json(response);
    // console.warn(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve paginated data" });
  }
});
