const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController')
const auth = require('../middleware/auth')

router.post('/createchatroom' ,auth,chatRoomController.createChatRoom)
router.delete('/deletechatroom/:chatRoomId', auth, chatRoomController.closeChatRoom);

module.exports = router