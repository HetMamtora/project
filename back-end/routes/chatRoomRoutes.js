const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController')
const auth = require('../middleware/auth')

router.post('/' ,auth,chatRoomController.createChatRoom)

module.exports = router