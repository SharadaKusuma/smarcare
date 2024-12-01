const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Patient = require('../models/Patient');  // Adjust the path to your Patient model

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Define where uploaded images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Use the original file name for simplicity
  },
});
const upload = multer({ storage: storage });

// Define the route for image upload
router.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  // Perform OCR on the uploaded image
  Tesseract.recognize(imagePath, 'eng', { logger: (m) => console.log(m) })
    .then(({ data: { text } }) => {
      console.log('Extracted text from OCR:', text); // Log the raw OCR text

      // Example: Extract data using regular expressions (adjust according to your OCR output)
      const extractedData = {
        patientID: text.match(/Patient ID: (\d+)/)?.[1],
        name: text.match(/Name: ([A-Za-z ]+)/)?.[1],
        wardNumber: text.match(/Ward Number: (\d+)/)?.[1],
        allowedFoodItems: text.match(/Allowed Food Items: (.+)/)?.[1].split(', ') || [],
      };

      console.log('Extracted Patient Data:', extractedData); // Log extracted data

      // Save the data to MongoDB
      const patient = new Patient({
        patientID: extractedData.patientID,
        name: extractedData.name,
        wardNumber: extractedData.wardNumber,
        allowedFoodItems: extractedData.allowedFoodItems,
      });

      patient.save()
        .then(() => {
          res.status(200).json({
            message: 'Patient data saved successfully',
            patient: extractedData,
          });
        })
        .catch((err) => {
          console.error('Error saving patient data:', err);
          res.status(500).json({ message: 'Error saving patient data' });
        });
    })
    .catch((err) => {
      console.error('Error during OCR processing:', err);
      res.status(500).json({ message: 'Error during OCR processing' });
    });
});

module.exports = router;
