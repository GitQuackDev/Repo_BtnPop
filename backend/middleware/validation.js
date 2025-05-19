/**
 * Validation middleware for API requests
 * Uses simple validation to ensure required fields are present
 */

/**
 * Validate news creation/update requests
 */
exports.validateNews = (req, res, next) => {
  const { title, content, author, category } = req.body;
  const errors = [];

  if (!title) errors.push('Title is required');
  if (!content) errors.push('Content is required');
  if (!author) errors.push('Author is required');
  if (!category) errors.push('Category is required');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate event creation/update requests
 */
exports.validateEvent = (req, res, next) => {
  const { title, description, eventDate, location, organizer } = req.body;
  const errors = [];

  if (!title) errors.push('Title is required');
  if (!description) errors.push('Description is required');
  if (!eventDate) errors.push('Event date is required');
  if (!location) errors.push('Location is required');
  if (!organizer) errors.push('Organizer is required');

  // Validate that eventDate is a valid date
  if (eventDate && isNaN(Date.parse(eventDate))) {
    errors.push('Event date must be a valid date');
  }

  // Validate endDate if present
  if (req.body.endDate && isNaN(Date.parse(req.body.endDate))) {
    errors.push('End date must be a valid date');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate user registration requests
 */
exports.validateUserRegistration = (req, res, next) => {
  const { username, email, password, role } = req.body;
  const errors = [];

  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  // Validate email format
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Email must be in valid format');
  }

  // Validate password strength
  if (password && password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Validate role if present
  if (role && !['admin', 'editor'].includes(role)) {
    errors.push('Role must be either "admin" or "editor"');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate login requests
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate password reset requests
 */
exports.validatePasswordReset = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const errors = [];

  if (!password) errors.push('New password is required');
  if (!confirmPassword) errors.push('Confirm password is required');
  
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  // Validate password strength
  if (password && password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
