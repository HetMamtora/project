const Users = require('../models/userModel'); // Ensure correct casing
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userController = {

    refreshtoken: async(req,res) => {
            try{
                const rf_token = req.cookies.refreshtoken;
                
                if(!rf_token){
                    return res.status(400).json({msg:"Please Login or Registers"})
                }

                jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user) => {
                    if(err){
                        return res.status(400).json({msg:"Please Login or Register"})   
                    }
                    
                    const accesstoken = createAccessToken({id:user.id})
                    res.json({accesstoken})
                })

            }
            catch(err){
                return res.status(500).json({msg:err.message})
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

            console.log('Hashed password:', hashedPassword);
            await newUser.save();

            res.status(201).json({ message: 'User registered successfully' });
        }
        catch(error){
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async(req,res) => {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: "User does not exist" });
            }

            if (!password) {
                return res.status(400).json({ msg: "Password is required" });
            }

            if (!user.password) {
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

    updateUser: async (req, res) => {
        try {
            const { id } = req.params; // Get the user ID from request parameters
            const { role } = req.user; // Get the role attribute of the logged-in user

            // If user is not an admin, return an error
            if (role !== 1) {
                return res.status(403).json({ msg: "Only admins can update user profiles" });
            }

            // If an admin, proceed with updating the user profile
            const updatedUser = await Users.findByIdAndUpdate(id, req.body, { new: true });

            if (!updatedUser) {
                return res.status(404).json({ msg: "User not found" });
            }

            res.json({ msg: "User profile updated successfully", user: updatedUser });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Internal server error" });
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
    }
}


const createAccessToken = (payload) => {
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}

module.exports = userController