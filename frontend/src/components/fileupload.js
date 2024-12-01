import React, { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // Append file to FormData object

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('File uploaded successfully!');
      } else {
        setMessage('Error uploading file.');
      }
    } catch (error) {
      setMessage('Error uploading file.');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}

export default FileUpload;
