const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Patient = require('./models/Patient'); // Import Patient model
const Menu = require('./models/Menu'); // Import Menu model (don't redefine it here)
const ordersRouter = require('./routes/orders'); // Import orders route

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
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

app.post('/api/canteen/update-menu', upload.single('menuImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Menu image is required' });
    }

    const imagePath = req.file.path;

    // Perform OCR on the menu image
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => console.log(m), // Log OCR progress
    });
    console.log('OCR Text:', text);

    // Extract food items from OCR text
    const extractedFoodItems = extractFoodItems(text);
    console.log('Extracted Food Items:', extractedFoodItems);

    if (extractedFoodItems.length === 0) {
      return res.status(400).json({ message: 'No valid food items found in the image' });
    }

    // Update the menu by appending or replacing food items
    const updatedMenu = await Menu.findOneAndUpdate(
      {}, // Use an empty filter to apply globally (assumes a single menu collection)
      { foodItems: extractedFoodItems }, // Replace food items with the new list
      { new: true, upsert: true } // Create new if no menu exists
    );

    console.log('Menu Updated:', updatedMenu);
    res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ message: 'Failed to update menu. Please try again.', error });
  }
});

// **View Orders** Route
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

// Use orders routes
app.use(ordersRouter);

// Function to extract menu data from OCR text
function extractFoodItems(ocrText) {
  const foodItemsMatch = ocrText.match(/food\s*items\s*[:\-]?\s*([\w\s,;]+)/i);

  return foodItemsMatch
    ? foodItemsMatch[1].split(/[,\s;]+/).map(item => item.trim()).filter(Boolean)
    : [];
}
// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});