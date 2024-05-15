const express = require('express')
const connectDB = require('./db')

const userRoutes = require('./routes/userRoutes');
const chatRoomRoutes = require('./routes/chatRoomRoutes')
const cookieParser = require('cookie-parser');

const app = express()
require('dotenv').config()

//Connect-DB
connectDB()

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

//Routes
app.use('/user', userRoutes);
app.use('/api/chatrooms', chatRoomRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Server is Running on PORT:",PORT)
})