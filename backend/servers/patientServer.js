const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Patient = require('../models/Patient'); // Adjust the path as necessary

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smarcare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Ensure the uploads directory exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Store with timestamp-based name
  }
});
const upload = multer({ storage: storage });

// Route for OCR processing
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Perform OCR using Tesseract
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    console.log('OCR Text:', text);

    // Extract patient data from OCR text
    const extractedData = extractPatientData(text);
    console.log('Extracted Patient Data:', extractedData);

    // Save patient data to MongoDB
    const patient = new Patient(extractedData);
    const savedPatient = await patient.save();

    console.log('Patient data saved:', savedPatient);
    res.status(200).json({
      message: 'Patient data saved successfully',
      patient: savedPatient,
    });
  } catch (error) {
    console.error('Error processing OCR:', error);
    res.status(500).json({ message: 'Error processing OCR', error });
  }
});

// Function to extract patient data from OCR text
function extractPatientData(ocrText) {
  const patientIDMatch = ocrText.match(/patientID\s*[:=]\s*(\d+)/i);
  const nameMatch = ocrText.match(/name\s*[:=]\s*([A-Za-z\s]+)(?=\s*wardNumber\s*[:=])/i);
  const wardNumberMatch = ocrText.match(/wardNumber\s*[:=]\s*(\d+)/i);
  const foodItemsMatch = ocrText.match(/allowedFoodItems\s*[:=]\s*([A-Za-z, ]+)/i);

  const patientData = {
    patientID: patientIDMatch ? patientIDMatch[1].trim() : 'Unknown',
    name: nameMatch ? nameMatch[1].trim() : 'Unknown',
    wardNumber: wardNumberMatch ? wardNumberMatch[1].trim() : 'Unknown',
    allowedFoodItems: foodItemsMatch
      ? foodItemsMatch[1].split(',').map(item => item.trim())
      : [],
  };

  return patientData;
}

// Start the server on port 5001
const port = 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
