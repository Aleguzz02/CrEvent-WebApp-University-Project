const LocationModel = require('../models/LocationModel');
const StaffModel = require('../models/StaffModel');

exports.getBrowseData = async (richiesta, risposta) => {
    try {
        const locationData = await LocationModel.getAllAvaiable();
        const staffData = await StaffModel.getAllAvaiable();

        risposta.status(200).json({
        success: true,
        data: {
            location: locationData,
            staff: staffData
        }
        });
    }catch(err){
        risposta.status(500).json({
            success: false,
            message: "Errore nel recupero dei dati",
            error: err.message
        });
    }
}
