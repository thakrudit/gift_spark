import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const connectDB = mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
    .then(() => {
        console.log("-----------DB Connection Successfully-----------")
    })
    .catch((err) => {
        console.log("-----------DB Connection Failed-----------")
    })

export default connectDB;


// const mongoose = require('mongoose');
// require('dotenv').config();

// // Define the mongodb connection url
// const mongoURL = process.env.MONGODB_URL;

// // Set up the mongo connection
// mongoose.connect(mongoURL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

// // get the default connection
// const db = mongoose.connection;

// // Define event listeners for databasee connection
// db.on('connected', ()=> {
//     console.log('Connected to mongodb server');
// })

// db.on('error', (err)=> {
//     console.log('Mongodb Connection error', err);
// })

// db.on('disconnected', ()=> {
//     console.log('Disconnected to mongodb server');
// })

// // Export db connection
// module.exports = db;