import React, { useState } from 'react';
import axios from 'axios';

function UpdateMenu() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage('Please select a menu image');
      return;
    }

    const formData = new FormData();
    formData.append('menuImage', selectedFile);

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5002/api/canteen/update-menu', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to update menu. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Menu'}
      </button>
      <p>{message}</p>
    </div>
  );
}

export default UpdateMenu;
