const LocationModel = require('../models/LocationModel');
const StaffModel = require('../models/StaffModel');

exports.getBrowseData = (richiesta, risposta) => {
    LocationModel.getAll((err, locationData) => {
        if (err) {
            return risposta.status(500).json({ 
                success: false, 
                message: "Errore nel recupero delle location.", 
                error: err.message 
            });
        }

        StaffModel.getAll((err, staffData) => {
            if (err) {
                return risposta.status(500).json({ 
                    success: false, 
                    message: "Errore nel recupero dei staff.", 
                    error: err.message 
                });
            }

            return risposta.status(200).json({ 
                success: true, 
                data: {
                    location: locationData, 
                    staff: staffData
                }
            });
        });
    });
}
