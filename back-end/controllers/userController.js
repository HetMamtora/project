const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userController = {

    refreshtoken: async(req,res) => {
            try{
                const rf_token = req.cookies.refreshtoken;
                
                if(!rf_token){
                    return res.status(400).json({msg:"Please Login or Registers"})
                }

                jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(error,user) => {
                    if(error){
                        return res.status(400).json({msg:"Please Login or Register"})   
                    }
                    
                    const accesstoken = createAccessToken({id:user.id})
                    res.json({accesstoken})
                })

            }
            catch(error){
                return res.status(500).json({msg:error.message})
            }
    },

    register: async (req, res) => {
        try{
            const { name, email, password } = req.body;
            const user = await Users.findOne({email})
            if(user){
                return res.status(400).json({msg:"Email Already Registered"})
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new Users({
                name,
                email,
                password: hashedPassword
            });

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        }
        catch(error){
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async(req,res) => {
        try{
            const { email, password } = req.body;

            const user = await Users.findOne({ email });
            if(!user){
                return res.status(400).json({ msg: "User does not exist" });
            }

            if(!password){
                return res.status(400).json({ msg: "Password is required" });
            }

            if(!user.password){
                return res.status(500).json({ msg: "User password not found" });
            }

            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(400).json({msg:"Incorrect Password"});
            }

            const accesstoken = createAccessToken({id:user._id});
            const refreshtoken = createRefreshToken({id:user._id});

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });

            res.json({accesstoken});
        }
        catch(error){
            console.error(error)
            return res.status(500).json({msg:error.message});
        }
    },

    userLogout: async(req,res) => {
        try{
            res.clearCookie('refreshtoken',{path:'/user/refresh_token'})
            return res.json({msg:"Logged Out"})
        }
        catch(err){
            return res.status(500).json({msg:err.message});
        }
    },

    getAllUsers: async(req,res) => {
        try{
            const allUsers = await Users.find().select('-password')

            if(!allUsers){
                return res.status(400).json({msg:"User Not Found"})
            }
            res.json(allUsers)
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },

    getUser: async(req,res) => {
        try{
            const user = await Users.findById(req.user.id).select('-password')

            if(!user){
                return res.status(400).json({msg:"User Not Found"})
            }
            res.json(user)
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },

    updateUser: async (req, res) => {
        try{
            const { id } = req.params;
            const updatedUser = await Users.findByIdAndUpdate(id, req.body, { new: true });

            if(!updatedUser){
                return res.status(404).json({ msg: "User not found" });
            }

            res.json({ msg: "User profile updated successfully", user: updatedUser });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedUser = await Users.findByIdAndDelete(id);
            if(!deletedUser){
                return res.status(404).json({ msg: "User not found" });
            }

            res.json({ msg: "User deleted successfully" });
        }
        catch (error){
            console.error(error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    }
}


const createAccessToken = (payload) => {
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}

module.exports = userController