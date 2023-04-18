const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.25c4jad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const appointmentOptionCollection = client.db("doctorsPortalsPro").collection("appointmentOption");
    const bookingsCollection = client.db("doctorsPortalsPro").collection("bookings");

    app.get('/appointmentOption', async(req, res) =>{
      const query = {};
      const cursor = appointmentOptionCollection.find(query);
      const appointment = await cursor.toArray();
      res.send(appointment);
    })

     

  } 
  
  finally {

  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("doctors portal server is running");
});

app.listen(port, () => {
  console.log(`Doctors portal running on ${port}`)
});
