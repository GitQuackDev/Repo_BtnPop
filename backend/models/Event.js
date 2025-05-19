const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  location: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Conference', 'Workshop', 'Meetup', 'Concert', 'Exhibition', 'Other'],
    default: 'Other',
  },
  isUpcoming: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  registrationUrl: {
    type: String,
  },
  registrationRequired: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  }
});

// Middleware to automatically set isUpcoming based on event date
EventSchema.pre('save', function(next) {
  const currentDate = new Date();
  if (this.eventDate < currentDate) {
    this.isUpcoming = false;
  } else {
    this.isUpcoming = true;
  }
  next();
});

// Add index for better performance on searches
EventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', EventSchema);
