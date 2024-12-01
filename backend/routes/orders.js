const express = require('express');
const Patient = require('../models/Patient'); // Import Patient model
const Menu = require('../models/Menu'); // Import Menu model

const router = express.Router();

// **View Orders** Route
router.get('/api/canteen/view-orders', async (req, res) => {
  try {
    // Fetch patients and menus based on matching ward number
    const patients = await Patient.find();
    const menus = await Menu.find();

    if (!patients.length) {
      return res.status(404).json({ message: 'No patients found' });
    }
    if (!menus.length) {
      return res.status(404).json({ message: 'No menus found' });
    }

    // Find matching food items between patients' allowed food items and menu food items
    const orders = patients.map((patient) => {
      const patientFoodItems = patient.allowedFoodItems;
      const matchingMenus = menus.filter((menu) =>
        menu.foodItems.some((item) => patientFoodItems.includes(item))
      );

      return matchingMenus.map((menu) => ({
        patientName: patient.name,
        patientID: patient.patientID,
        wardNumber: patient.wardNumber,
        foodItems: menu.foodItems.filter((item) =>
          patientFoodItems.includes(item)
        ),
      }));
    }).flat(); // Flatten the orders array

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
});

module.exports = router;
