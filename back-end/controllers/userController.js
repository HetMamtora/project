const Users = require('../models/userModel'); // Ensure correct casing
const bcrypt = require('bcrypt');

const userController = {

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
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = userController