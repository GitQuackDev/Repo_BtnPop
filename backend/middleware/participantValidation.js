/**
 * Validate participant registration
 */
exports.validateParticipantRegistration = (req, res, next) => {
  const { name, email, phone } = req.body;
  const errors = [];

  if (!name) errors.push('Name is required');
  if (!email) errors.push('Email is required');
  if (!phone) errors.push('Phone number is required');

  // Validate email format
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Email must be in valid format');
  }

  // Validate phone format (simple validation)
  if (phone && !/^[0-9+\-() ]{7,20}$/.test(phone)) {
    errors.push('Phone number must be valid');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
