const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { authenticateJWT, isEditorOrAdmin } = require('../middleware/auth');
const { validateParticipantRegistration } = require('../middleware/participantValidation');

// Public route - Register for an event
router.post('/:eventId/register', validateParticipantRegistration, participantController.registerForEvent);

// Public route - Generate PDF ticket
router.get('/ticket/:id', (req, res, next) => {
  console.log(`[PDF Generation Route] Matched /ticket/:id for participant ID: ${req.params.id}`);
  participantController.generateTicket(req, res, next);
});

// Public route - Verify registration by join ID
router.get('/verify/:joinId', participantController.checkParticipant);

// Protected routes (require authentication)
router.get('/event/:eventId', 
  authenticateJWT, 
  isEditorOrAdmin, 
  participantController.getEventParticipants
);

router.get('/:id', 
  authenticateJWT, 
  isEditorOrAdmin, 
  participantController.getParticipantById
);

router.put('/:id/status', 
  authenticateJWT, 
  isEditorOrAdmin, 
  participantController.updateParticipantStatus
);

module.exports = router;
