const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());


app.get('/', async(req, res) =>{
    res.send('doctors portal server is running');
})