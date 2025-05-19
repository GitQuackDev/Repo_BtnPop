/**
 * This script runs as a scheduled task to update the isUpcoming flag for events
 * based on their eventDate. Events with dates in the past will be marked as not upcoming.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function updateEventStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
    
    const currentDate = new Date();
    
    // Find all events with eventDate in the past but still marked as upcoming
    const events = await Event.find({ 
      eventDate: { $lt: currentDate },
      isUpcoming: true
    });
    
    if (events.length === 0) {
      console.log('No events need to be updated.');
      process.exit(0);
      return;
    }
    
    console.log(`Found ${events.length} events to update...`);
    
    // Update all events to mark them as not upcoming
    const result = await Event.updateMany(
      { _id: { $in: events.map(event => event._id) } },
      { $set: { isUpcoming: false } }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} events!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating event status:', error);
    process.exit(1);
  }
}

// Run the update function
updateEventStatus();
