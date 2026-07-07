const { body } = require('express-validator');

// Validatori per la registrazione (signup)
const signupValidators = [
  // Nome: obbligatorio, solo lettere (incluse accentate) e spazi, trim
  body('nome')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Il nome può contenere solo lettere e spazi'),

  // Cognome: obbligatorio, solo lettere (incluse accentate) e spazi, trim
  body('cognome')
    .trim()
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Il cognome può contenere solo lettere e spazi'),

  // Data di nascita: formato YYYY-MM-DD, obbligatoria
  body('dataNascita')
    .notEmpty().withMessage('La data di nascita è obbligatoria')
    .isISO8601().withMessage('Data di nascita non valida (formato YYYY-MM-DD)')
    // Opzionale: controllo età minima (es. 18 anni)
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        throw new Error('Devi avere almeno 18 anni');
      }
      return true;
    }),

  // Email: obbligatoria, formato valido, normalizzata (trim + lowercase + canonical)
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false }) // mantiene i punti per Gmail (opzionale)
    .isEmail().withMessage('Email non valida'),

  // Telefono: obbligatorio, 10 cifre numeriche
  body('telefono')
    .trim()
    .notEmpty().withMessage('Il telefono è obbligatorio')
    .isNumeric().withMessage('Il telefono deve contenere solo numeri')
    .isLength({ min: 10, max: 10 }).withMessage('Il telefono deve avere esattamente 10 cifre'),

  // Password: obbligatoria, almeno 8 caratteri, con maiuscola, minuscola e numero
  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
    .isLength({ min: 8 }).withMessage('La password deve avere almeno 8 caratteri')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'),

  // Conferma password: deve corrispondere a password
  body('confermaPassword')
    .notEmpty().withMessage('Conferma la password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Le password non coincidono')
];

// Validatori per il login
const loginValidators = [
  // Email: obbligatoria, formato valido
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email non valida'),

  // Password: obbligatoria (non applichiamo restrizioni di complessità, solo presenza)
  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
];

module.exports = {
  signupValidators,
  loginValidators
};