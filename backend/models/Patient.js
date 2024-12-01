const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientID: String,
  name: String,
  wardNumber: String,
  allowedFoodItems: [String],
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
