import React, { useState } from 'react';
import axios from 'axios';

function PatientInterface() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // Handle form submission (image upload)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // Make the POST request to upload the image
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Set the extracted patient data in state
      setPatientData(response.data.patient);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('There was an error uploading the image or processing the OCR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Patient Data Upload</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="imageUpload">Select an image:</label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload Image'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {patientData && (
        <div>
          <h2>Extracted Patient Data:</h2>
          <ul>
            <li><strong>Patient ID:</strong> {patientData.patientID}</li>
            <li><strong>Name:</strong> {patientData.name}</li>
            <li><strong>Ward Number:</strong> {patientData.wardNumber}</li>
            <li><strong>Allowed Food Items:</strong> {patientData.allowedFoodItems.join(', ')}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PatientInterface;
