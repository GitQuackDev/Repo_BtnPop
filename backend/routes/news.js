const express = require('express');
const router = express.Router();
const {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getFeaturedNews,
    getTrendingNews,
    getLatestNews,
    likeNews,
    dislikeNews
} = require('../controllers/newsController');
const { authenticateJWT, isEditorOrAdmin } = require('../middleware/auth');
const { validateNews } = require('../middleware/validation');
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
router.get('/', getAllNews);
router.get('/featured', getFeaturedNews);
router.get('/trending', getTrendingNews);
router.get('/:id', getNewsById);

// Protected routes (require authentication)
router.post('/', 
  authenticateJWT, 
  isEditorOrAdmin, 
  upload.single('image'),
  validateNews,
  createNews
);

router.put('/:id', 
  authenticateJWT, 
  isEditorOrAdmin, 
  upload.single('image'), 
  updateNews
);

router.delete('/:id', 
  authenticateJWT, 
  isEditorOrAdmin, 
  deleteNews
);

// Like and Dislike routes
router.post('/:id/like', likeNews);
router.post('/:id/dislike', dislikeNews);

module.exports = router;
