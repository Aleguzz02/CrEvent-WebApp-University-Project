const { body } = require('express-validator');

const signupValidators = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Il nome può contenere solo lettere e spazi'),

  body('cognome')
    .trim()
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Il cognome può contenere solo lettere e spazi'),

  body('dataNascita')
    .notEmpty().withMessage('La data di nascita è obbligatoria')
    .isISO8601().withMessage('Data di nascita non valida (formato YYYY-MM-DD)')
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

  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false }) 
    .isEmail().withMessage('Email non valida'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('Il telefono è obbligatorio')
    .isNumeric().withMessage('Il telefono deve contenere solo numeri')
    .isLength({ min: 10, max: 10 }).withMessage('Il telefono deve avere esattamente 10 cifre'),

  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
    .isLength({ min: 8 }).withMessage('La password deve avere almeno 8 caratteri')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'),

  body('confermaPassword')
    .notEmpty().withMessage('Conferma la password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Le password non coincidono')
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email non valida'),

  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
];

const optionalUrl = (field, message) => body(field)
  .trim()
  .optional({ values: 'falsy' })
  .isURL({ require_protocol: true })
  .withMessage(message);

const dateRangeValidator = body('dataFine')
  .notEmpty().withMessage('La data di fine è obbligatoria')
  .isISO8601().withMessage('Data di fine non valida')
  .custom((value, { req }) => {
    if (!req.body.dataInizio) return true;

    const dataInizio = new Date(req.body.dataInizio);
    const dataFine = new Date(value);

    if (dataInizio > dataFine) {
      throw new Error('La data di inizio deve essere precedente o uguale alla data di fine');
    }

    return true;
  });

const startDateNotPastValidator = body('dataInizio')
  .notEmpty().withMessage('La data di inizio è obbligatoria')
  .isISO8601().withMessage('Data di inizio non valida')
  .custom((value) => {
    console.log('Validazione dataInizio:', value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dataInizio = new Date(value);
    dataInizio.setHours(0, 0, 0, 0);

    if (dataInizio < today) {
      throw new Error('La data di inizio non può essere nel passato');
    }

    return true;
  });

const adminLocationValidators = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Il nome della location è obbligatorio')
    .isLength({ max: 100 }).withMessage('Il nome della location è troppo lungo'),

  body('indirizzo')
    .trim()
    .notEmpty().withMessage('L\'indirizzo è obbligatorio')
    .isLength({ max: 150 }).withMessage('L\'indirizzo è troppo lungo'),

  body('citta')
    .trim()
    .notEmpty().withMessage('La città è obbligatoria')
    .matches(/^[a-zA-ZÀ-ÿ\s'’-]+$/).withMessage('La città può contenere solo lettere, spazi, apostrofi e trattini')
    .isLength({ max: 80 }).withMessage('La città è troppo lunga'),

  body('descrizione')
    .trim()
    .notEmpty().withMessage('La descrizione è obbligatoria')
    .isLength({ max: 2000 }).withMessage('La descrizione è troppo lunga'),

  body('capienza')
    .notEmpty().withMessage('La capienza è obbligatoria')
    .isInt({ min: 1, max: 100000 }).withMessage('La capienza deve essere un numero intero positivo')
    .toInt(),

  body('costo')
    .notEmpty().withMessage('Il costo è obbligatorio')
    .isFloat({ min: 0.01 }).withMessage('Il costo deve essere un numero positivo')
    .toFloat(),

  startDateNotPastValidator,

  dateRangeValidator,

  body('urlImg')
    .trim()
    .notEmpty().withMessage('L\'immagine è obbligatoria')
    .isLength({ max: 255 }).withMessage('Percorso immagine troppo lungo'),

  optionalUrl('linkSito', 'Link sito non valido'),

  body('lat')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitudine non valida')
    .toFloat(),

  body('lng')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitudine non valida')
    .toFloat(),

  body('accountEmail')
    .trim()
    .notEmpty().withMessage('L\'email account è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email account non valida'),

  body('gestoreNome')
    .trim()
    .optional({ values: 'falsy' })
    .matches(/^[a-zA-ZÀÈÉÌÒÙàèéìòù\s'’’-]+$/).withMessage('Il nome può contenere solo lettere, spazi, apostrofi e trattini')
    .isLength({ max: 80 }).withMessage('Il nome è troppo lungo'),

  body('gestoreCognome')
    .trim()
    .optional({ values: 'falsy' })
    .matches(/^[a-zA-ZÀÈÉÌÒÙàèéìòù\s'’’-]+$/).withMessage('Il cognome può contenere solo lettere, spazi, apostrofi e trattini')
    .isLength({ max: 80 }).withMessage('Il cognome è troppo lungo'),
];

const adminStaffValidators = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Il nome dello staff è obbligatorio')
    .matches(/^[a-zA-ZÀ-ÿ\s'’-]+$/).withMessage('Il nome può contenere solo lettere, spazi, apostrofi e trattini')
    .isLength({ max: 80 }).withMessage('Il nome è troppo lungo'),

  body('cognome')
    .trim()
    .notEmpty().withMessage('Il cognome dello staff è obbligatorio')
    .matches(/^[a-zA-ZÀ-ÿ\s'’-]+$/).withMessage('Il cognome può contenere solo lettere, spazi, apostrofi e trattini')
    .isLength({ max: 80 }).withMessage('Il cognome è troppo lungo'),

  body('tipo')
    .trim()
    .notEmpty().withMessage('Il tipo staff è obbligatorio')
    .isIn(['catering', 'intrattenimento', 'fotografo', 'altro']).withMessage('Tipo staff non valido'),

  body('costo')
    .notEmpty().withMessage('Il costo è obbligatorio')
    .isFloat({ min: 0.01 }).withMessage('Il costo deve essere un numero positivo')
    .toFloat(),

  body('descrizione')
    .trim()
    .notEmpty().withMessage('La descrizione è obbligatoria')
    .isLength({ max: 2000 }).withMessage('La descrizione è troppo lunga'),

  body('genereMusicale')
    .trim()
    .optional({ values: 'falsy' })
    .isLength({ max: 100 }).withMessage('Il genere musicale è troppo lungo'),

  body('genereFotografico')
    .trim()
    .optional({ values: 'falsy' })
    .isLength({ max: 100 }).withMessage('Il genere fotografico è troppo lungo'),

  body('mansione')
    .trim()
    .optional({ values: 'falsy' })
    .isLength({ max: 100 }).withMessage('La mansione è troppo lunga'),

  body('locationIds')
    .isArray({ min: 1 }).withMessage('Seleziona almeno una location'),

  body('locationIds.*')
    .isInt({ min: 1 }).withMessage('ID location non valido')
    .toInt(),

  startDateNotPastValidator,

  dateRangeValidator,

  body('urlImg')
    .trim()
    .notEmpty().withMessage('L\'immagine è obbligatoria')
    .isLength({ max: 255 }).withMessage('Percorso immagine troppo lungo'),

  optionalUrl('linkSito', 'Link sito non valido'),

  body('accountEmail')
    .trim()
    .notEmpty().withMessage('L\'email account staff è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email account staff non valida')
];

const requestOtpValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email non valida')
];

const verifyOtpValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email non valida'),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('L\'OTP è obbligatorio')
    .isLength({ min: 6, max: 6 }).withMessage('OTP deve essere di 6 cifre')
    .isNumeric().withMessage('OTP deve contenere solo numeri')
];

const resetPasswordValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Email non valida'),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('L\'OTP è obbligatorio')
    .isLength({ min: 6, max: 6 }).withMessage('OTP deve essere di 6 cifre')
    .isNumeric().withMessage('OTP deve contenere solo numeri'),
  
  body('newPassword')
    .notEmpty().withMessage('La nuova password è obbligatoria')
    .isLength({ min: 8 }).withMessage('La password deve avere almeno 8 caratteri')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Conferma la password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Le password non coincidono')
];

module.exports = {
  signupValidators,
  loginValidators,
  adminLocationValidators,
  adminStaffValidators,
  requestOtpValidators,
  verifyOtpValidators,
  resetPasswordValidators
};
