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
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          default: 'member',
          enum: ['member', 'cr-admin'],
        }
      }],
})

module.exports = mongoose.model('ChatRoomMembers', ChatRoomMembersSchema)