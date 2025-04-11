require('dotenv').config();
const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MongoUrl).then(() => {
    console.log('Database Connected');
}).catch((err) => {
    console.error('Database connection error:', err);
});

app.post('/register', async (req, res) => {
    // Use req.body directly instead of req.body.Inputvalue
    const { name, password, email } = req.body; 

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        // Create a new user
        const user = await User.create({ name, password: hashedPassword, email });
        res.status(200).json(user);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    // Use req.body directly instead of req.body.Inputvalue
    const { password, email } = req.body; 

    try {
        const user = await User.findOne({ email });

        if (user) {
            // Compare the password
            const isMatch = await bcrypt.compare(password, user.password);
        
            if (isMatch) {
                // Create JWT token
                const token = await jwt.sign(
                    { name: user.name, id: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                // Send both the message, token, and user's name
                res.status(200).json({ msg: 'success', token, name: user.name });
            } else {
                res.status(200).json({ msg: 'false' });
            }
        } else {
            res.status(404).json({ msg: 'No user found with this email.' });
        }
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(3001, () => {
    console.log("Server is running ");
});
