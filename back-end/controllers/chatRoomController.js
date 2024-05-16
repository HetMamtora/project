const ChatRoom = require('../models/chatRoomModel');
const ChatRoomMembers = require('../models/chatRoomMembersModel');
const User = require('../models/userModel');

const chatRoomController = {
    createChatRoom: async(req,res) => {
        try{
            const loggedInUser = req.user;
            if (!loggedInUser) {
                return res.status(401).json({ msg: 'User not authenticated' });
            }

            const { name, members } = req.body;

            
            const chatRoom = new ChatRoom({
                name,
                members: members || [],
                admin: loggedInUser._id, 
            });

          
            await chatRoom.save();

    
            const chatRoomMembers = new ChatRoomMembers({
                chatRoomId: chatRoom._id,
                members: [loggedInUser._id, ...(members || [])],
            });

   
            await chatRoomMembers.save();

    
            loggedInUser.role = 'cr-admin';
            await loggedInUser.save();

            res.json(chatRoom);
        }
        catch(error){
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
}

module.exports = chatRoomController