const Tesseract = require('tesseract.js');

const extractOcrDataFromImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    // Start OCR processing
    Tesseract.recognize(
      imagePath,  // Path to the image you want to process
      'eng',      // Language code (English in this case)
      {
        logger: (m) => console.log(m),  // Optional for logging progress
      }
    )
      .then(({ data: { text } }) => {
        console.log('OCR Text:', text);
        
        // Extract data (you can modify this to parse the OCR result and extract your specific data)
        const extractedData = {
          patientId: '12345',   // You can dynamically extract these values from OCR result (e.g., using regex)
          patientName: 'John Doe',  // Example static value
          wardNumber: '12A',       // Example static value
          foodItems: ['dosa', 'idli', 'sambar'],  // Example static list; you can dynamically extract these
        };

        resolve(extractedData); // Return the extracted data
      })
      .catch((error) => {
        console.error('Error during OCR processing:', error);
        reject('Error processing OCR data');
      });
  });
};

module.exports = { extractOcrDataFromImage };
