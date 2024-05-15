const ChatRoom = require('../models/chatRoomModel');
const ChatRoomMembers = require('../models/chatRoomMembersModel');
const User = require('../models/userModel');

const chatRoomController = {
    createChatRoom: async(req,res) => {
        try{
            const loggedInUser = req.user; // Assuming req.user is populated by your authentication middleware
            if (!loggedInUser) {
                return res.status(401).json({ msg: 'User not authenticated' });
            }

            const { name, members } = req.body;

            // Add the logged-in user as the admin of the chat room
            const chatRoom = new ChatRoom({
                name,
                members: members || [],
                admin: loggedInUser._id, // Assigning the logged-in user as the admin
            });

            // Save the chat room
            await chatRoom.save();

    // Create a separate collection for users in the chat room
            const chatRoomMembers = new ChatRoomMembers({
                chatRoomId: chatRoom._id,
                members: [loggedInUser._id, ...(members || [])],
            });

    // Save the chat room members collection
            await chatRoomMembers.save();

    // Assign temporary role of cr-admin to the user
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