import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

function OCRUpload() {
  // State to store the file and OCR extracted text
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Perform OCR when the file is uploaded
  const handleUpload = () => {
    if (!file) {
      alert('Please upload an image file.');
      return;
    }

    setLoading(true);
    Tesseract.recognize(
      file,
      'eng', // Language for OCR, 'eng' for English
      {
        logger: (m) => console.log(m), // Logs the OCR process
      }
    ).then(({ data: { text } }) => {
      setExtractedText(text); // Set the extracted text in the state
      setLoading(false);
      
      // Send OCR data to the backend to store in the database
      uploadPatientData(text);
    }).catch((err) => {
      console.error("OCR Error:", err);
      setLoading(false);
    });
  };

  // Function to upload the OCR extracted data to the backend
  const uploadPatientData = async (extractedText) => {
    // Assuming extractedText is in a structured format like "patientID | 1, name: Latha, wardNumber : 5, allowedFoodItems : dosa"
    const patientData = parseOCRData(extractedText); // Parse the extracted text into a usable format
    
    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      
      if (response.ok) {
        alert('Patient data uploaded successfully!');
      } else {
        alert('Failed to upload patient data.');
      }
    } catch (error) {
      console.error('Error uploading data:', error);
      alert('Error uploading data');
    }
  };

  // Function to parse OCR text into structured data
  const parseOCRData = (text) => {
    const lines = text.split('\n');
    const patientData = {};
    
    lines.forEach((line) => {
      if (line.includes('patientID')) {
        patientData.patientID = line.split('|')[1].trim();
      }
      if (line.includes('name:')) {
        patientData.name = line.split(':')[1].trim();
      }
      if (line.includes('wardNumber')) {
        patientData.wardNumber = line.split(':')[1].trim();
      }
      if (line.includes('allowedFoodItems')) {
        patientData.allowedFoodItems = line.split(':')[1].trim();
      }
    });
    
    return patientData;
  };

  return (
    <div>
      <h2>Upload Image for OCR</h2>
      
      {/* File input for uploading image */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Upload'}
      </button>
      
      {/* Display extracted text */}
      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <pre>{extractedText}</pre> {/* Display OCR extracted text */}
        </div>
      )}
    </div>
  );
}

export default OCRUpload;
