const Event = require('../models/EventModel');
const User = require('../models/userModel');


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