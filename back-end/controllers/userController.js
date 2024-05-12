const Users = require('../models/userModel'); // Ensure correct casing
const bcrypt = require('bcrypt');

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

            // Hash the password
            const passwordHash = await bcrypt.hash(password,10)

            // Create a new user
            const newUser = new Users({
                name,
                email,
                password: passwordHash,
            });

            // Save the user to the database
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
            const {email,password} = req.body;

            const user = await Users.findOne({email});
            if(!user){
                return res.status(400).json({msg:"User does not exist"});
            }

            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(400).json({msg:"Incorrect Password"});
            }

            const accesstoken = createAccessToken({id:user._id});
            const refreshtoken = createRefreshToken({id:user._id});

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token' // Absolute path
            });

            res.json({accesstoken});
            //res.json({message:"Login Successful"})
        }
        catch(error){
            console.error(error)
            return res.status(500).json({msg:error.message});
        }
    },
}


const createAccessToken = (payload) => {
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}

module.exports = userController