const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    // // Use Aggregate to query multiple collection and then merge data
    // app.get("/appointmentOption", async (req, res) => {
    //   const date = req.query.date;
    //   const options = await appointmentOptionCollection.find().toArray();

    //   // get the bookings of the provider date
    //   const bookingQuery = { appointmentDate: date };
    //   const alreadyBooked = await bookingsCollection
    //     .find(bookingQuery)
    //     .toArray();

    //   // code carefully :D
    //   options.forEach((option) => {
    //     const optionBooked = alreadyBooked.filter(
    //       (book) => book.treatment === option.name
    //     );
    //     const bookedSlots = optionBooked.map((book) => book.slot);
    //     const remainingSlots = option.slots.filter(
    //       (slot) => !bookedSlots.includes(slot)
    //     );
    //     option.slots = remainingSlots;
    //   });

    //   res.send(options);
    // });

    app.get('/appointmentOption', async (req, res) => {
      const date = req.query.date;

      // step 1:  get all services
      const services = await appointmentOptionCollection.find().toArray();

      // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
      const query = { date: date };
      const bookings = await bookingsCollection.find(query).toArray();

      // step 3: for each service
      services.forEach(service => {
          // step 4: find bookings for that service. output: [{}, {}, {}, {}]
          const serviceBookings = bookings.filter(book => book.treatment === service.name);
          // step 5: select slots for the service Bookings: ['', '', '', '']
          const bookedSlots = serviceBookings.map(book => book.slot);
          // step 6: select those slots that are not in bookedSlots
          const available = service.slots.filter(slot => !bookedSlots.includes(slot));
          //step 7: set available to slots to make it easier 
          service.slots = available;
      });


      res.send(services);
  })
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
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
