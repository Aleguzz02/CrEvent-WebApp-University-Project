// Libreria jsonwebtoken
const jwt = require("jsonwebtoken");

// Chiave segreta per firmare e verificare i JWT
const SECRET = "secretkey2026";

// Export del modulo che assicura che solo le richieste con valido JWT
// nell'header authorization possono accedere alle routes protette
module.exports = (req, res, next) => {
    // Controllo header "authorization" nella richiesta http
    const authHeader = req.headers["authorization"];
    // Se non presente -> 401 Unauthorized
    if (!authHeader) {
        return res.status(401).json({message: "Accesso negato"});
    }

    // Se presente, estraggo il token
    const token = authHeader.split(" ")[1];

    try {
        console.log("Token ricevuto: ", token);
        console.log("Chiave segreta usata per la verifica: ", SECRET);
        // Verifica token con chiave segreta
        const verified = jwt.verify(token, SECRET);

        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Token non valido"});
    }
}