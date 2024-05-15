const mongoose = require('mongoose')

const ChatRoomMembersSchema = new mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
})

module.exports = mongoose.model('ChatRoomMembersModel', ChatRoomMembersSchema)