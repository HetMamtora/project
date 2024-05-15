const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    isClosed: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('ChatRoom', ChatRoomSchema)