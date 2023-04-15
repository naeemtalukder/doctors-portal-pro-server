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

    // Use Aggregate to query multiple collection and then merge data
    app.get("/appointmentOption", async (req, res) => {
      const date = req.query.date;
      const query = {};
      const options = await appointmentOptionCollection.find().toArray();

      // get the bookings of the provider date
      const bookingQuery = { appointmentDate: date };
      const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

      // code carefully :D
      options.forEach((option) => {
        const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
        const bookedSlots = optionBooked.map(book => book.slot);
        
        const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
        option.slots = remainingSlots;
        
      })

      res.send(options);
    });

    // app.get('/v2/appointmentOption', async(req, res) => {

    // })


    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const query = {
        _id: new ObjectId(booking.id)
      }
      const options = await appointmentOptionCollection.findOne(query);
      console.log(options);
      const remainingSlots =options.slots.filter(slot=> slot !== booking.slot)
      const updated = {name: options.name, slots: remainingSlots}
      await appointmentOptionCollection.updateOne(query, {
        $set: updated
      })
 

      // const alreadyBooked = await bookingsCollection.find(query).toArray();
      // if(alreadyBooked.length){
      //   const message = `You already have a booking on ${booking.appointmentDate}`
      //   return res.send({acknowledged: false, message})
      // }
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
  } finally {

  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("doctors portal server is running");
});

app.listen(port, () => console.log(`Doctors portal running on ${port}`));
