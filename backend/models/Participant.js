const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ParticipantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  joinId: {
    type: String,
    unique: true,
    default: () => uuidv4(),
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'no-show'],
    default: 'registered',
  },
  additionalInfo: {
    type: String,
  }
});

// Create index for better search performance
ParticipantSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Participant', ParticipantSchema);
