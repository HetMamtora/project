const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('./db')

const userRoutes = require('./routes/userRoutes');

const app = express()
require('dotenv').config()

//Connect-DB
connectDB()

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//Routes
app.use('/user', userRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Server is Running on PORT:",PORT)
})