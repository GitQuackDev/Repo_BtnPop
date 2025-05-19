const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

// Generate a slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .concat('-', Date.now().toString().slice(-6)); // Add timestamp to ensure uniqueness
}

// Get all events with pagination and filters
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      upcoming, 
      category, 
      featured,
      search,
      startDate,
      endDate 
    } = req.query;
    
    const query = {};
    
    // Apply filters if provided
    if (upcoming === 'true') query.isUpcoming = true;
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) query.eventDate.$gte = new Date(startDate);
      if (endDate) query.eventDate.$lte = new Date(endDate);
    }
    
    // Apply text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { eventDate: 1 }, // Sort by event date ascending (upcoming first)
    };
    
    const events = await Event.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort);
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalEvents: total,
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {    const { limit = 5 } = req.query;
    
    const currentDate = new Date();
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Find events that start today or in the future, or have an end date in the future
    const events = await Event.find({
      $or: [
        { eventDate: { $gte: todayStart } },
        { endDate: { $gte: todayStart } }
      ],
      isUpcoming: true
    })
      .limit(parseInt(limit, 10))
      .sort({ eventDate: 1 }); // Earliest events first
    
    res.json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event by ID or slug
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if the ID is a MongoDB ObjectId or a slug
    let event;
    if (eventId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      event = await Event.findById(eventId);
    } else {
      // It's a slug
      event = await Event.findOne({ slug: eventId });
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    console.log("createEvent req.body:", req.body); // Added log
    console.log("createEvent req.file:", req.file); // Added log

    const { 
      title, 
      description, 
      eventDate,
      eventTime,
      endDate,
      endTime, 
      location,
      organizer,
      category,
      registrationUrl,
      registrationRequired,
      registrationEnabled,
      maxParticipants,
      isFeatured,
      coordinates
    } = req.body;

    let imageUrl = '';
    
    // Handle file upload if provided
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const slug = generateSlug(title);
    
    // Handle coordinates if provided
    let parsedCoordinates = undefined;
    if (coordinates) {
      try {
        parsedCoordinates = JSON.parse(coordinates);
      } catch (error) {
        console.error('Error parsing coordinates:', error);
      }
    }
    
    const event = new Event({
      title,
      description,
      imageUrl,
      eventDate: new Date(eventDate),
      eventTime,
      endDate: endDate ? new Date(endDate) : undefined,
      endTime,
      location,
      coordinates: parsedCoordinates,
      organizer,
      category: category || 'Other',
      registrationUrl,
      registrationRequired: registrationRequired === 'true',
      registrationEnabled: registrationEnabled === 'true',
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      isFeatured: isFeatured === 'true',
      slug,
    });
    
    const savedEvent = await event.save();
    console.log("createEvent savedEvent (before sending response):", savedEvent); // Added log
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      eventDate,
      eventTime,
      endDate,
      endTime, 
      location,
      organizer,
      category,
      registrationUrl,
      registrationRequired,
      registrationEnabled,
      maxParticipants,
      isFeatured,
      coordinates
    } = req.body;
    
    const eventToUpdate = await Event.findById(req.params.id);
    
    if (!eventToUpdate) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Handle file upload if provided
    if (req.file) {
      // Delete old image if it exists
      if (eventToUpdate.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', eventToUpdate.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      eventToUpdate.imageUrl = `/uploads/${req.file.filename}`;
    }
      // Update fields
    eventToUpdate.title = title || eventToUpdate.title;
    eventToUpdate.description = description || eventToUpdate.description;
    
    if (eventDate) {
      eventToUpdate.eventDate = new Date(eventDate);
    }
    
    if (eventTime !== undefined) {
      eventToUpdate.eventTime = eventTime;
    }
    
    if (endDate) {
      eventToUpdate.endDate = new Date(endDate);
    } else if (endDate === '') {
      eventToUpdate.endDate = undefined;
    }
    
    if (endTime !== undefined) {
      eventToUpdate.endTime = endTime;
    }
    
    eventToUpdate.location = location || eventToUpdate.location;
    eventToUpdate.organizer = organizer || eventToUpdate.organizer;
    eventToUpdate.category = category || eventToUpdate.category;
    
    // Handle coordinates update
    if (coordinates) {
      try {
        const parsedCoordinates = JSON.parse(coordinates);
        eventToUpdate.coordinates = parsedCoordinates;
      } catch (error) {
        console.error('Error parsing coordinates:', error);
      }
    }
    
    if (registrationUrl !== undefined) {
      eventToUpdate.registrationUrl = registrationUrl;
    }
    
    if (registrationRequired !== undefined) {
      eventToUpdate.registrationRequired = registrationRequired === 'true';
    }
    
    if (registrationEnabled !== undefined) {
      eventToUpdate.registrationEnabled = registrationEnabled === 'true';
    }
    
    if (maxParticipants !== undefined) {
      eventToUpdate.maxParticipants = maxParticipants ? parseInt(maxParticipants) : undefined;
    }
    
    if (isFeatured !== undefined) {
      eventToUpdate.isFeatured = isFeatured === 'true';
    }
    
    // Update slug only if title is changed
    if (title && title !== eventToUpdate.title) {
      eventToUpdate.slug = generateSlug(title);
    }
    
    eventToUpdate.updatedAt = Date.now();
    
    const updatedEvent = await eventToUpdate.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const eventToDelete = await Event.findById(req.params.id);
    
    if (!eventToDelete) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete associated image if it exists
    if (eventToDelete.imageUrl) {
      const imagePath = path.join(__dirname, '..', eventToDelete.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
