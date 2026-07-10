const jwt = require("jsonwebtoken");

const SECRET = "secretkey2026";


module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({
            success: false, 
            message: "Accesso negato"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        console.log("Token ricevuto: ", token);
        const verified = jwt.verify(token, SECRET);

        req.user = verified;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message : "Token scaduto. Effettua di nuovo il login"});
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message : "Token di autenticazione non valido"});
        } else {
            return res.status(400).json({ message: "Errore nella verifica del token" });
        }
    }
}