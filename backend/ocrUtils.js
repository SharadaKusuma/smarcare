const tesseract = require('tesseract.js');

async function extractDataFromFile(filePath) {
  try {
    console.log('Processing file with OCR:', filePath);  // Log the file path

    const { data: { text } } = await tesseract.recognize(filePath, 'eng', {
      logger: (m) => console.log(m),
    });

    console.log('OCR Result:', text);  // Log OCR result

    // Example logic to extract relevant data from OCR result
    const extractedData = {
      patientId: '12345', // Example placeholder data
      patientName: 'John Doe',
      wardNumber: '12A',
      foodItems: ['Rice', 'Vegetables', 'Soup'], // Example food items
    };

    return extractedData;
  } catch (error) {
    console.error('Error during OCR extraction:', error);
    throw error;  // Throw error if OCR fails
  }
}

module.exports = { extractDataFromFile };
