/**
 * This script runs as a scheduled task to update the isUpcoming flag for events
 * based on their eventDate and endDate.
 * 
 * Events are considered "not upcoming" (past) when:
 * 1. The event has an endDate that's in the past, OR
 * 2. The event has no endDate AND its eventDate is in the past
 * 
 * This ensures proper categorization of multi-day events that span across dates.
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
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Find all events that have ended but are still marked as upcoming
    // An event is considered ended when both its eventDate is in the past
    // and either it has no endDate or the endDate is also in the past
    const events = await Event.find({
      $and: [
        { 
          $or: [
            { endDate: { $lt: todayStart } },
            { $and: [{ endDate: null }, { eventDate: { $lt: todayStart } }] }
          ]
        },
        { isUpcoming: true }
      ]
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
