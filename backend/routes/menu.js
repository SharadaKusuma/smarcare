const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu'); // Import Menu model

// Route: Get all menu items
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find(); // Fetch all menus from the database
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Failed to fetch menus', error });
  }
});

// Route: Add or Update Menu based on OCR result
router.post('/update', async (req, res) => {
  const { foodItems } = req.body;

  if (!foodItems || foodItems.length === 0) {
    return res.status(400).json({ message: 'Food items are required' });
  }

  try {
    // Find the existing menu or create a new one
    const updatedMenu = await Menu.findOneAndUpdate(
      {}, // Empty filter ensures a single menu collection
      { foodItems }, // Update food items with the new list
      { new: true, upsert: true } // Create a new menu if none exists
    );

    res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ message: 'Failed to update menu', error });
  }
});

// Route: Delete all menus
router.delete('/', async (req, res) => {
  try {
    await Menu.deleteMany();
    res.status(200).json({ message: 'All menus deleted successfully' });
  } catch (error) {
    console.error('Error deleting menus:', error);
    res.status(500).json({ message: 'Failed to delete menus', error });
  }
});

module.exports = router;
