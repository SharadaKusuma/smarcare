const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  foodItems: {
    type: [String], // Array of strings for food items
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);
