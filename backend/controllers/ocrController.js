const Patient = require('../models/Patient'); // Import the Patient model

// Sample OCR output data (you will replace this with actual OCR data)
const ocrOutput = {
  name: 'Latha',
  age: 30,
  ward: 5,
  food: 'dosa',
};

// Function to save the OCR data to the database
const savePatientData = async (ocrData) => {
  try {
    // Create a new patient document with the OCR data
    const newPatient = new Patient({
      name: ocrData.name,
      age: ocrData.age,
      ward: ocrData.ward,
      food: ocrData.food,
    });

    // Save the new patient document to the database
    const savedPatient = await newPatient.save();
    console.log('Patient saved:', savedPatient);
  } catch (err) {
    console.error('Error saving patient:', err);
  }
};

// Export the function so it can be used in other parts of the app
module.exports = {
  savePatientData,
};
