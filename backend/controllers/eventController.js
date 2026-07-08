const Event = require('../models/EventModel');
const LocationModel = require('../models/LocationModel');
const User = require('../models/userModel');
const StaffModel = require('../models/StaffModel');


exports.getEvents = async (request,response) => {
    try{
        const email = request.user.email;

        console.log("event of user: ", email);
        const user = await User.findByEmail(email);

        if(!user) 
            return response.status(404).json({
                success: false,
                message: "Utente non registrato"
            });
            
        const events = await Event.getUserEvents(email);
        
        response.status(200).json({
            success: true,
            data: events
        })

    }catch(err){
        response.status(500).json({
            success: false,
            message: "Errore nel recupero degli eventi",
            error: err.message
        });
    }
}

exports.getLocationFreeDates = async (request,response) => {
    try{
        const id = request.query.id;
        
        const intervals = await LocationModel.getFreeDates(id);
        const usedDates = await LocationModel.getUsedDates(id);
        
        response.status(200).json({
            success: true,
            freeDates: intervals,
            usedDates: usedDates
        });
    }catch(err){
        response.status(500).json({
        success: false,
        message: "Errore nel recupero delle date della location",
        error: err.message
    });
    }
}

exports.getLocations = async (request, response) => {
    try {
        const capacity = Number(request.query.capacity);
        const day = request.query.day;

        if (!Number.isFinite(capacity) || capacity < 0) {
            return response.status(400).json({
                success: false,
                message: "Capienza non valida"
            });
        }// da mettere nel middleware

        const locations = day
            ? await LocationModel.getCapacityAndDate(day, capacity)
            : await LocationModel.getCapacity(capacity);

        response.status(200).json({
            success: true,
            data: locations
        });
  } catch (err) {
    response.status(500).json({
      success: false,
      message: "Errore nel recupero delle location",
      error: err.message
    });
  }
};

exports.getEventDetail = async (req, res) => {
  const event = req.event;

  const location = await LocationModel.getByEventId(event.id);
  const staff = await StaffModel.getByEventId(event.id);

  res.json({
    success: true,
    data: {
      ...event,
      location,
      staff
    }
  });
};

exports.getAvailableStaff = async (request, response) => {
  try {
    const idLocation = Number(request.query.idLocation);
    const day = request.query.day;

    if (!Number.isFinite(idLocation) || !day) {
      return response.status(400).json({
        success: false,
        message: 'Parametri non validi'
      });
    }

    const customLocation = request.query.customLocation === 'true';

    const staff = customLocation
      ? await StaffModel.getAvailableForCustomLocation(day)
      : await StaffModel.getAvailableByLocationAndDate(idLocation, day);


    response.status(200).json({
      success: true,
      data: staff
    });
  } catch (err) {
    response.status(500).json({
      success: false,
      message: 'Errore nel recupero dello staff disponibile',
      error: err.message
    });
  }
};