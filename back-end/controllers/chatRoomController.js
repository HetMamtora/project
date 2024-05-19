const ChatRoom = require('../models/chatRoomModel');
const ChatRoomMembers = require('../models/chatRoomMembersModel');
const User = require('../models/userModel');

const chatRoomController = {

    createChatRoom: async(req,res) => {
        try{
            const loggedInUser = req.user;
        
            if(!loggedInUser){
                return res.status(401).json({ msg: 'User not authenticated' });
            }

            const { name, members } = req.body;
            if(!name){
                return res.status(400).json({ msg: 'Chat room name is required' });
            }
        
            // Create the chat room
            const chatRoom = new ChatRoom({
                name,
                members: members || [],
                admin: loggedInUser._id,
            });
        
            await chatRoom.save();
        
            const memberDetails = await User.find({ _id: { $in: members } }).select('name');

            //PREPARE MEMBERS WITH ROLES
            const chatRoomMembersData = [{
                    userId: loggedInUser._id,
                    name: loggedInUser.name,
                    role: 'cr-admin'
                },
                ...memberDetails.map(memberId => ({ userId: memberId, name: memberId.name, role: 'member' }))
                //...memberDetails.map(member=> ({ userId: member._id, name: member.name, role: 'member' }))
            ];

            console.log(chatRoomMembersData)
        
            const chatRoomMembers = new ChatRoomMembers({
              chatRoomId: chatRoom._id,
              members: chatRoomMembersData,
            });
        
            await chatRoomMembers.save();
        
            res.json(chatRoom);
        }
        catch(error){
            console.error("Error message:", error.message);
            res.status(500).send('Server Error');
        }
    },

    closeChatRoom:  async(req,res) => {
        try {
            const loggedInUser = req.user;
        
            if (!loggedInUser) {
              return res.status(401).json({ msg: 'User not authenticated' });
            }
        
            const { chatRoomId } = req.params;
        
            // Find the chat room by ID
            const chatRoom = await ChatRoom.findById(chatRoomId);
        
            if (!chatRoom) {
              return res.status(404).json({ msg: 'Chat room not found' });
            }
        
            // Find the user's role in the chat room
            const chatRoomMembers = await ChatRoomMembers.findOne({ chatRoomId });
        
            if (!chatRoomMembers) {
              return res.status(404).json({ msg: 'Chat room members not found' });
            }
        
            const userRole = chatRoomMembers.members.find(
              (member) => member.userId.toString() === loggedInUser._id.toString()
            );
        
            if (!userRole || userRole.role !== 'cr-admin') {
              return res.status(403).json({ msg: 'User is not authorized to close this chat room' });
            }
        
            // Delete the chat room
            await ChatRoom.findByIdAndDelete(chatRoomId);
        
            // Delete the members of the chat room
            await ChatRoomMembers.findOneAndDelete({ chatRoomId });
        
            res.json({ msg: 'Chat room closed and members removed' });
          } catch (error) {
            console.error("Error message:", error.message);
            res.status(500).send('Server Error');
          }
    }
}

module.exports = chatRoomController