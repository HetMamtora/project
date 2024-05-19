const mongoose = require('mongoose')

const ChatRoomMembersSchema = new mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
      },
      members: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          default: 'member',
          enum: ['member', 'cr-admin'],
        }
      }],
})

module.exports = mongoose.model('ChatRoomMembersModel', ChatRoomMembersSchema)