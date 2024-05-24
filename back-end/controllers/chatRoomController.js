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
        
            const memberDetails = await User.find({ _id: { $in: members } }).select('name username');

            //PREPARE MEMBERS WITH ROLES
            const chatRoomMembersData = [{
                    userId: loggedInUser._id,
                    name: loggedInUser.name,
                    username: loggedInUser.username,
                    role: 'cr-admin'
                },
                ...memberDetails.map(memberId => ({ userId: memberId, name: memberId.name, username: memberId.username, role: 'member' }))
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

    getChatRoomDetails: async(req,res) => {
        try {
            const loggedInUser = req.user;
            const { chatRoomId } = req.params;
    
            if (!loggedInUser) {
                return res.status(401).json({ msg: 'User not authenticated' });
            }
    
            // Check if the chat room exists
            const chatRoom = await ChatRoom.findById(chatRoomId);
            if (!chatRoom) {
                return res.status(404).json({ msg: 'Chat room not found' });
            }
    
            // Check if the logged-in user is a member of the chat room
            const chatRoomMembers = await ChatRoomMembers.findOne({ chatRoomId });
            if (!chatRoomMembers) {
                return res.status(404).json({ msg: 'Chat room members not found' });
            }
    
            const isMember = chatRoomMembers.members.some(member => member.userId.toString() === loggedInUser._id.toString());
            if (!isMember) {
                return res.status(403).json({ msg: 'User is not a member of this chat room' });
            }
    
            // Get member details
            const memberDetails = chatRoomMembers.members.map(member => ({
                username: member.username,
                role: member.role
            }));
    
            res.json({
                chatRoom: {
                    id: chatRoom._id,
                    name: chatRoom.name,
                    members: memberDetails
                }
            });
        } catch (error) {
            console.error("Error message:", error.message);
            res.status(500).send('Server Error');
        }
    },

    closeChatRoom:  async(req,res) => {
        try{
            const loggedInUser = req.user;
        
            if(!loggedInUser){
                return res.status(401).json({ msg: 'User not authenticated' });
            }
        
            const { chatRoomId } = req.params;
        
            //FIND CHAT ROOM - ID 
            const chatRoom = await ChatRoom.findById(chatRoomId);
        
            if(!chatRoom){
                return res.status(404).json({ msg: 'Chat room not found' });
            }
        
            //VERIFY USER ROLE TO DELETE (cr-admin)
            const chatRoomMembers = await ChatRoomMembers.findOne({ chatRoomId });
        
            if(!chatRoomMembers){
                return res.status(404).json({ msg: 'Chat room members not found' });
            }
        
            const userRole = chatRoomMembers.members.find(
                (member) => member.userId.toString() === loggedInUser._id.toString()
            );
        
            if(!userRole || userRole.role !== 'cr-admin'){
                return res.status(403).json({ msg: 'User is not authorized to close this chat room' });
            }
        
            //DELETE CHAT ROOM
            await ChatRoom.findByIdAndDelete(chatRoomId);
        
            //DELETE CHAT ROOM MEMBERS
            await ChatRoomMembers.findOneAndDelete({ chatRoomId });
        
            res.json({ msg: 'Chat room closed and members removed' });
          }
          catch(error){
            console.error("Error message:", error.message);
            res.status(500).send('Server Error');
        }
    },

    removeSingleMember: async(req,res) => {
        try{
            const loggedInUser = req.user;
            const { chatRoomId, memberId } = req.params;

            // Find the chat room
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
                return res.status(403).json({ msg: 'User is not authorized to remove members from this chat room' });
            }

            // Remove the member
            chatRoomMembers.members = chatRoomMembers.members.filter(
                (member) => member.userId.toString() !== memberId
            );

            await chatRoomMembers.save();

            chatRoom.members = chatRoom.members.filter(
                (member) => member.toString() !== memberId
              );
              await chatRoom.save();

            res.json({ msg: 'Member removed from the chat room' });
        }
        catch(error){

        }
    },

    leaveChatRoom: async(req,res) => {
        try {
            const loggedInUser = req.user;
            const { chatRoomId } = req.params;
        
            // Find the chat room members
            const chatRoomMembers = await ChatRoomMembers.findOne({ chatRoomId });
            if (!chatRoomMembers) {
                return res.status(404).json({ msg: 'Chat room members not found' });
            }
        
            // Remove the logged-in member from chatRoomMembers
            chatRoomMembers.members = chatRoomMembers.members.filter(
                (member) => member.userId.toString() !== loggedInUser._id.toString()
            );
            await chatRoomMembers.save();
        
            // Remove the logged-in member from chatRoom
            const chatRoom = await ChatRoom.findById(chatRoomId);
            chatRoom.members = chatRoom.members.filter(
                (member) => member.toString() !== loggedInUser._id.toString()
            );
            await chatRoom.save();
        
            res.json({ msg: 'You have left the chat room' });
          }
          catch (error) {
                console.error("Error message:", error.message);
                res.status(500).send('Server Error');
          }
    }
}

module.exports = chatRoomController