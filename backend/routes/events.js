const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateJWT, isEditorOrAdmin } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (require authentication)
router.post('/', 
  authenticateJWT, 
  isEditorOrAdmin, 
  upload.single('image'),
  validateEvent,
  eventController.createEvent
);

router.put('/:id', 
  authenticateJWT, 
  isEditorOrAdmin, 
  upload.single('image'), 
  eventController.updateEvent
);

router.delete('/:id', 
  authenticateJWT, 
  isEditorOrAdmin, 
  eventController.deleteEvent
);

module.exports = router;
