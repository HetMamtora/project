const ChatRoom = require('../models/chatRoomModel');
const ChatRoomMembers = require('../models/chatRoomMembersModel');
const User = require('../models/userModel');

const chatRoomController = {
    createChatRoom: async(req,res) => {
        try {
            const loggedInUser = req.user;
            console.log("Logged in user:", loggedInUser);
        
            if (!loggedInUser) {
              return res.status(401).json({ msg: 'User not authenticated' });
            }
        
            const { name, members } = req.body;
            console.log("Chat room name:", name);
            console.log("Chat room members:", members);
        
            if (!name) {
              return res.status(400).json({ msg: 'Chat room name is required' });
            }
        
            // Create the chat room
            const chatRoom = new ChatRoom({
              name,
              members: members || [],
              admin: loggedInUser._id,
            });
            console.log("ChatRoom object:", chatRoom);
        
            await chatRoom.save();
        
            // Prepare members with roles
            const chatRoomMembersData = [
              { userId: loggedInUser._id, role: 'cr-admin' },
              ...(members || []).map(memberId => ({ userId: memberId, role: 'member' }))
            ];
        
            const chatRoomMembers = new ChatRoomMembers({
              chatRoomId: chatRoom._id,
              members: chatRoomMembersData,
            });
            console.log("ChatRoomMembers object:", chatRoomMembers);
        
            await chatRoomMembers.save();
        
            res.json(chatRoom);
          } catch (error) {
            console.error("Error message:", error.message);
            console.error("Stack trace:", error.stack);
            res.status(500).send('Server Error');
          }
    },

    /*closeChatRoom:  async(req,res) => {
        try {
            const { chatRoomId } = req.params;
            const loggedInUser = req.user;
        
            const chatRoom = await ChatRoom.findById(chatRoomId);
            if (!chatRoom) {
              return res.status(404).json({ msg: 'Chat room not found' });
            }
        
            if (chatRoom.admin.toString() !== loggedInUser._id.toString()) {
              return res.status(401).json({ msg: 'User not authorized' });
            }
        
            chatRoom.isClosed = true;
            await chatRoom.save();
        
            await ChatRoomMembers.findOneAndDelete({ chatRoomId: chatRoomId });
        
            loggedInUser.role = 'user';
            await loggedInUser.save();
        
            res.json({ msg: 'Chat room closed and members removed' });
          } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
          }
    }*/
}

module.exports = chatRoomController