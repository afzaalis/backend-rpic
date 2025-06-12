const express = require('express');
const router = express.Router();
const userModel = require('../model/user');

// Get all users
router.get('/users', (req, res) => {
  userModel.getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.status(200).json(users);
  });
});

// Get user by ID
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  userModel.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch user' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  });
});

// Update profile
router.put('/updateProfile', async (req, res) => {
  const { id, name, email } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ error: 'ID, name, and email are required' });
  }

  try {
    const updatedUser = await new Promise((resolve, reject) => {
      userModel.updateUserById(id, { name, email }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
