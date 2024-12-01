const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Patient = require('../models/Patient'); // Import Patient model
const Menu = require('../models/Menu'); // Import Menu model (don't redefine it here)
const ordersRouter = require('../routes/orders'); // Import orders route

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/smarcare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Multer setup for image upload (OCR for Menu Update)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save images to the 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.png');  // Save with a unique filename
  }
});
const upload = multer({ storage: storage });

// OCR route for updating the menu
app.post('/api/canteen/update-menu', upload.single('menuImage'), async (req, res) => {
  try {
    console.log('Request received at /api/canteen/update-menu');

    // Check if file is uploaded
    if (!req.file) {
      console.error('No file provided in the request');
      return res.status(400).json({ message: 'Menu image is required' });
    }

    const imagePath = req.file.path;
    console.log('Image uploaded to path:', imagePath);

    // OCR
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => console.log('OCR Progress:', m), // Logging OCR progress
    });
    console.log('OCR Text:', text);

    if (!text || text.trim() === '') {
      console.error('OCR did not extract any text');
      return res.status(400).json({ message: 'OCR did not extract any text from the image' });
    }

    // Extract food items from OCR text
    const extractedFoodItems = extractFoodItems(text);
    console.log('Extracted Food Items:', extractedFoodItems);

    if (extractedFoodItems.length === 0) {
      console.error('No valid food items found in OCR text');
      return res.status(400).json({ message: 'No valid food items found in the image' });
    }

    // Save extracted food items to the menu
    const updatedMenu = await Menu.findOneAndUpdate(
      {},  // Use an empty filter to apply globally (assumes a single menu collection)
      { foodItems: extractedFoodItems },  // Replace food items with the new list
      { new: true, upsert: true }  // Create new if no menu exists
    );
    console.log('Menu Updated in DB:', updatedMenu);

    res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });
  } catch (error) {
    console.error('Error in menu update route:', error);
    res.status(500).json({ message: 'Failed to update menu. Please try again.', error });
  }
});

// View Orders route
app.get('/api/canteen/view-orders', async (req, res) => {
  try {
    const patients = await Patient.find();
    const menus = await Menu.find();

    if (!patients.length) {
      return res.status(404).json({ message: 'No patients found' });
    }
    if (!menus.length) {
      return res.status(404).json({ message: 'No menus found' });
    }

    // Match food items between patients and menus
    const orders = patients.map((patient) => {
      const matchingMenus = menus.filter((menu) =>
        menu.foodItems.some((item) => patient.allowedFoodItems.includes(item))
      );

      return matchingMenus.map((menu) => ({
        patientName: patient.name,
        patientID: patient.patientID,
        wardNumber: menu.wardNumber,
        foodItems: menu.foodItems.filter((item) =>
          patient.allowedFoodItems.includes(item)
        ),
      }));
    }).flat();

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
});

// Function to extract food items from OCR text
function extractFoodItems(ocrText) {
  const regexPatterns = [
    /food\s*items\s*[:\-]?\s*([\w\s,;]+)/i,  // Default pattern
    /menu\s*[:\-]?\s*([\w\s,;]+)/i,          // Alternative pattern for 'menu:'
    /([\w\s,;]+)$/,                          // Fallback for plain item lists
  ];

  for (const pattern of regexPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      return match[1]
        .split(/[,\s;]+/)
        .map(item => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

// Use orders routes
app.use(ordersRouter);

// Start the server
const port = 5002;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
