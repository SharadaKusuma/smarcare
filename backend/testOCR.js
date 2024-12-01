const Tesseract = require('tesseract.js');
const path = require('path');

// Provide the full path to your test image
const imagePath = path.join(__dirname, '/uploads/1732698437938.png');  // replace with a valid image path

Tesseract.recognize(
  imagePath,
  'eng',  // Language for OCR (use 'eng' for English)
  {
    logger: (m) => console.log(m),  // This logs the OCR progress
  }
)
  .then(({ data: { text } }) => {
    console.log('OCR Result:', text);
  })
  .catch((err) => {
    console.error('Error during OCR:', err);
  });
