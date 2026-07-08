const { validationResult } = require('express-validator');

/**
 Middleware per gestire gli errori di validazione di express-validator.
 Eseguito dopo i middleware di controllo dati in input.
 Se ci sono errori, risponde con status 400 e un array di oggetti errore.
 Altrimenti passa al prossimo middleware/controller.
 */
const handleValidationErrors = (req, res, next) => {
  // Estrae gli eventuali errori dalla richiesta
  const errors = validationResult(req);

  // Se non ci sono errori, prosegui
  if (errors.isEmpty()) {
    return next();
  }

  // Prendiamo il primo errore per il messaggio principale
  const firstError = errors.array()[0];
  const message = firstError ? firstError.msg : 'Errore di validazione';

  // Rispondi con 400 Bad Request e i dettagli degli errori
  return res.status(400).json({
    success: false,
    message,                    // Messaggio riassuntivo catturato dal frontend
    errors: errors.array()      // Array completo con tutti i dettagli
  });
};

module.exports = handleValidationErrors;