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
  eventTime: {
    type: String,
  },
  endDate: {
    type: Date,
  },
  endTime: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    }
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
  registrationEnabled: {
    type: Boolean,
    default: true,
  },
  maxParticipants: {
    type: Number,
  },
  participantCount: {
    type: Number,
    default: 0,
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

// Middleware to automatically set isUpcoming based on event date and endDate
EventSchema.pre('save', function(next) {
  const currentDate = new Date();
  const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  // Get the end date (use eventDate if no endDate is specified)
  const endDate = this.endDate || this.eventDate;
  // Normalize end date to end of day
  const endDateEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
  
  // Event is upcoming if it hasn't ended yet
  this.isUpcoming = endDateEnd >= todayStart;
  
  this.updatedAt = Date.now();
  next();
});

// Add index for better performance on searches
EventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', EventSchema);
