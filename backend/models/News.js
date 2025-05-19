const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  summary: { // Added summary field
    type: String,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['General', 'Technology', 'Business', 'Entertainment', 'Sports', 'Science', 'Health', 'World', 'Lifestyle', 'Travel', 'Education', 'Environment', 'Local News', 'Politics', 'Culture', 'Opinion', 'Feature'], // Added 'Feature'
    default: 'General',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  publishDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  }
});

// Add index for better performance on searches
NewsSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('News', NewsSchema);
