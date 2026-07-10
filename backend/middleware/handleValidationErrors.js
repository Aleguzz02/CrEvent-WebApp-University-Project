const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log('Errori di validazione:', errors.array());

  if (errors.isEmpty()) {
    return next();
  }

  const firstError = errors.array()[0];
  const message = firstError ? firstError.msg : 'Errore di validazione';

  return res.status(400).json({
    success: false,
    message,                    
    errors: errors.array()      
  });
};

module.exports = handleValidationErrors;