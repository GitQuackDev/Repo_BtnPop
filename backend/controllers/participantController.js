const Participant = require('../models/Participant');
const Event = require('../models/Event');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Register for an event
exports.registerForEvent = async (req, res) => {
  try {
    const { name, email, phone, additionalInfo } = req.body;
    const eventId = req.params.eventId;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event registration is enabled
    if (!event.registrationEnabled) {
      return res.status(400).json({ message: 'Registration for this event is not available' });
    }
    
    // Check if the event has reached maximum participants
    if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }
    
    // Check if user is already registered
    const existingRegistration = await Participant.findOne({ event: eventId, email });
    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You are already registered for this event',
        participantId: existingRegistration._id,
        joinId: existingRegistration.joinId
      });
    }
    
    // Create new participant
    const participant = new Participant({
      name,
      email,
      phone,
      event: eventId,
      additionalInfo
    });
    
    const savedParticipant = await participant.save();
    
    // Increment participant count in event
    await Event.findByIdAndUpdate(eventId, { $inc: { participantCount: 1 } });
    
    res.status(201).json({
      message: 'Registration successful!',
      participant: savedParticipant
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get participants for an event
exports.getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Check if event exists
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get all participants for this event with pagination
    const { page = 1, limit = 20 } = req.query;
    
    const participants = await Participant.find({ event: eventId })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ registrationDate: -1 });
    
    const total = await Participant.countDocuments({ event: eventId });
    
    res.json({
      participants,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalParticipants: total,
    });
  } catch (error) {
    console.error('Get event participants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get participant details by ID
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('event', 'title eventDate location');
      
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Get participant by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update participant status
exports.updateParticipantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['registered', 'attended', 'cancelled', 'no-show'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const participant = await Participant.findById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    // Update status
    participant.status = status;
    const updatedParticipant = await participant.save();
    
    res.json(updatedParticipant);
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate PDF ticket
exports.generateTicket = async (req, res) => {
  console.log(`[PDF Generation Route] Entered generateTicket function for participant ID: ${req.params.id}`);
  let doc; // Define doc here to access it in the catch block if needed
  let tmpFilePath; // Define here for access in error handlers and finally

  try {
    const participantId = req.params.id;
    
    const participant = await Participant.findById(participantId)
      .populate('event', 'title eventDate eventTime location organizer');
      
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (!participant.event || typeof participant.event !== 'object') {
      console.error(`Event data not found or not populated for participant ${participantId}. Event ID: ${participant.event}`);
      return res.status(500).json({ message: 'Error retrieving event details for the ticket. The associated event may no longer exist.' });
    }
    
    doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    const tmpDir = os.tmpdir();
    // Ensure a unique filename to prevent conflicts if cleanup fails
    tmpFilePath = path.join(tmpDir, `event-ticket-${String(participant.joinId || 'unknown')}-${Date.now()}.pdf`);
    console.log(`[PDF Generation] Attempting to write PDF to temporary file: ${tmpFilePath}`);

    const writeStream = fs.createWriteStream(tmpFilePath);
    doc.pipe(writeStream);

    doc.on('error', (pdfError) => {
      console.error(`[PDF Generation] PDFKit document stream error for ${tmpFilePath}:`, pdfError);
      // writeStream.end(); // Ensure write stream is closed on doc error
      // No need to manually unlink here, main catch/finally should handle it if tmpFilePath is set
      if (!res.headersSent) {
        // It's tricky to send a JSON response here as the writeStream might still be trying to interact with res via its 'finish' handler
        // Best to let the main error handling or writeStream error handler manage the response.
        console.error('[PDF Generation] Headers not sent, but PDF doc stream errored. Client will likely hang or timeout.');
      }
    });

    // Restore original PDF content generation
    console.log(`[PDF Generation] Adding content to PDF for ${tmpFilePath}`);
    doc.fontSize(20).font('Helvetica-Bold').text('Event Registration Confirmation', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text('Registration ID:', { continued: true });
    doc.font('Helvetica').text(` ${String(participant.joinId || 'N/A')}`);
    doc.moveDown();
    
    doc.fontSize(16).font('Helvetica-Bold').text('Event Details');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Event:', { continued: true });
    doc.font('Helvetica').text(` ${String(participant.event.title || 'N/A')}`);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Date:', { continued: true });
    const eventDateStr = participant.event.eventDate ? 
      new Date(participant.event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }) : 'N/A';
    doc.font('Helvetica').text(` ${eventDateStr}`);
    
    if (participant.event.eventTime) {
      doc.fontSize(12).font('Helvetica-Bold').text('Time:', { continued: true });
      doc.font('Helvetica').text(` ${String(participant.event.eventTime || 'N/A')}`);
    }
    
    doc.fontSize(12).font('Helvetica-Bold').text('Location:', { continued: true });
    doc.font('Helvetica').text(` ${String(participant.event.location || 'N/A')}`);
    doc.moveDown();
    
    doc.fontSize(16).font('Helvetica-Bold').text('Participant Information');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Name:', { continued: true });
    doc.font('Helvetica').text(` ${String(participant.name || 'N/A')}`);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Email:', { continued: true });
    doc.font('Helvetica').text(` ${String(participant.email || 'N/A')}`);
    
    if (participant.phone) {
      doc.fontSize(12).font('Helvetica-Bold').text('Phone:', { continued: true });
      doc.font('Helvetica').text(` ${String(participant.phone)}`);
    }
    doc.moveDown(2);
    
    doc.fontSize(10).font('Helvetica-Oblique').text('Please bring this ticket and a photo ID to the event.', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text('Generated on ' + new Date().toLocaleString(), { align: 'center' });
    console.log(`[PDF Generation] Content added. Attempting to finalize PDF for participant ${participantId} (joinId: ${String(participant.joinId || 'unknown')}). Temp file: ${tmpFilePath}`);
    
    doc.end(); // Finalize the PDF and end the stream to the file

    writeStream.on('finish', () => {
      console.log(`[PDF Generation] PDF successfully written to temporary file: ${tmpFilePath}. File size: ${fs.existsSync(tmpFilePath) ? fs.statSync(tmpFilePath).size : 'N/A'}`);
      
      if (!fs.existsSync(tmpFilePath)) {
        console.error(`[PDF Generation] Temporary PDF file does not exist at path after writeStream finish: ${tmpFilePath}`);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error generating PDF: Temporary file not found after creation attempt.' });
        }
        return;
      }
      if (fs.statSync(tmpFilePath).size === 0) {
        console.warn(`[PDF Generation] Temporary PDF file is empty: ${tmpFilePath}`);
        // Optionally, you could decide to not send an empty PDF
        // For now, we will still attempt to send it for diagnostic purposes.
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=event-ticket-${String(participant.joinId || 'unknown')}.pdf`);
      
      console.log(`[PDF Generation] Sending temporary PDF file ${tmpFilePath} to client.`);
      res.sendFile(tmpFilePath, (err) => {
        if (err) {
          console.error(`[PDF Generation] Error sending temp PDF file ${tmpFilePath}:`, err);
          if (!res.headersSent) {
            // Avoid sending JSON if headers might have been partially sent by res.sendFile
            if (!res.writableEnded) {
                console.log('[PDF Generation] Sending 500 status due to sendFile error.');
                res.status(500).send('Error sending PDF file.');
            } else {
                console.log('[PDF Generation] sendFile error, but response already ended or headers sent.');
            }
          }
        } else {
          console.log(`[PDF Generation] Temporary PDF file ${tmpFilePath} sent successfully.`);
        }
        // Clean up the temporary file in all cases (success or error in sending)
        console.log(`[PDF Generation] Attempting to delete temporary file: ${tmpFilePath}`);
        fs.unlink(tmpFilePath, (unlinkErr) => {
          if (unlinkErr) console.error(`[PDF Generation] Error deleting temp PDF file ${tmpFilePath}:`, unlinkErr);
          else console.log(`[PDF Generation] Temporary PDF file ${tmpFilePath} deleted.`);
        });
      });
    });

    writeStream.on('error', (streamErr) => {
      console.error(`[PDF Generation] Error writing PDF to temp file (writeStream error for ${tmpFilePath}):`, streamErr);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Server error during PDF file creation', error: streamErr.message });
      }
      // Attempt to clean up the temp file if it exists, as sendFile part won't run
      if (fs.existsSync(tmpFilePath)) {
        console.log(`[PDF Generation] Attempting to delete temp file ${tmpFilePath} after writeStream error.`);
        fs.unlink(tmpFilePath, (unlinkErr) => {
          if (unlinkErr) console.error(`[PDF Generation] Error deleting temp PDF file ${tmpFilePath} after stream error:`, unlinkErr);
        });
      }
    });

  } catch (error) {
    console.error('[PDF Generation] Generate ticket error (main catch block):', error);
    if (tmpFilePath && fs.existsSync(tmpFilePath)) {
      console.log(`[PDF Generation] Cleaning up temp file ${tmpFilePath} due to error in main catch block.`);
      fs.unlink(tmpFilePath, (unlinkErr) => {
        if (unlinkErr) console.error(`[PDF Generation] Error deleting temp PDF file ${tmpFilePath} in main catch:`, unlinkErr);
      });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during ticket generation', error: error.message });
    } else {
      console.error('[PDF Generation] Error occurred after PDF headers sent (main catch block). Response may be corrupted.');
      if (!res.writableEnded) {
        res.end(); 
      }
    }
  }
};

// Check participant by joinId
exports.checkParticipant = async (req, res) => {
  try {
    const joinId = req.params.joinId;
    
    const participant = await Participant.findOne({ joinId })
      .populate('event', 'title eventDate eventTime location');
      
    if (!participant) {
      return res.status(404).json({ message: 'Invalid registration ID' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Check participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
