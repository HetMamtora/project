/*const jwt = require('jsonwebtoken')

const auth = (req,res,next) => {
    try{
        const token = req.header("Authorization")
        
        if(!token){
            return res.status(400).json({msg:"Invalid Authentication"})
        }

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user) => {
            if(err){
                return res.status(400).json({msg:"Invalid Authentication"})
            }

            req.user = user
            next()
        })
    }
    catch(err)
    {
        return res.status(500).json({msg:err.message})
    }
}

module.exports = auth */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    
    if (!token) {
      return res.status(400).json({ msg: "Invalid Authentication" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ msg: "Invalid Authentication" });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
