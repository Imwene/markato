// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import User from '../models/userModel.js'; // Create a user model

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Create payload
    const payload = {
      user: {
        id: user._id,
        role: user.role 
      }
    };

    // Sign token
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ 
          success: true,
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};