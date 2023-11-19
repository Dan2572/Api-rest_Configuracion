const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000;
const configuracionRoutes = require("./routes/configuracion");

//middleware
app.use(express.json());
app.use('/api', configuracionRoutes)

//routes
app.get('/', (req, res) => {
    res.send('Welcome to my API')
});

//mongodb connection
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('connected to mongodb')).catch((error) => console.error(error));


app.listen(port, () => console.log('server listenig on port', port));