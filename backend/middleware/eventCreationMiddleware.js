const LocationModel = require('../models/LocationModel');
const StaffModel = require('../models/StaffModel');

const badRequest = (res, message) =>
  res.status(400).json({ success: false, message });

const conflict = (res, message) =>
  res.status(409).json({ success: false, message });

const normalizeDate = (value) => {
  if (typeof value !== 'string') return null;

  const day = value.substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;

  const parsed = new Date(`${day}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return day;
};

const eventCreationMiddleware = async (req, res, next) => {
  try {
    const { event, location, staff = [], date } = req.body;

    if (!event || !location) {
      return badRequest(res, 'Dati evento incompleti');
    }

    const nome = typeof event.name === 'string' ? event.name.trim() : '';
    const invitati = Number(event.capacity);
    const data = normalizeDate(date);

    if (!nome || nome.length > 50) {
      return badRequest(res, 'Nome evento non valido');
    }

    if (!Number.isInteger(invitati) || invitati < 1) {
      return badRequest(res, 'Numero invitati non valido');
    }

    if (!data) {
      return badRequest(res, 'Data evento non valida');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(`${data}T00:00:00`);
    if (eventDate < today) {
      return badRequest(res, 'La data evento non puo essere nel passato');
    }

    if (!Array.isArray(staff)) {
      return badRequest(res, 'Staff non valido');
    }

    const staffIds = staff.map((s) => Number(s.id));

    if (staffIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      return badRequest(res, 'ID staff non valido');
    }

    if (new Set(staffIds).size !== staffIds.length) {
      return badRequest(res, 'Staff duplicato');
    }

    const isCustomLocation = location.custom === true;
    let selectedLocation;
    let idLocation = null;

    if (isCustomLocation) {
      const lat = Number(location.lat);
      const lng = Number(location.lng);
      const nomeLocation = typeof location.nome === 'string'
        ? location.nome.trim()
        : '';

      if (!nomeLocation) {
        return badRequest(res, 'Nome location personalizzata non valido');
      }

      if (
        !Number.isFinite(lat) || lat < -90 || lat > 90 ||
        !Number.isFinite(lng) || lng < -180 || lng > 180
      ) {
        return badRequest(res, 'Coordinate location non valide');
      }

      selectedLocation = {
        custom: true,
        nome: nomeLocation,
        lat,
        lng,
        costo: 0
      };
    } else {
      idLocation = Number(location.id);

      if (!Number.isInteger(idLocation) || idLocation <= 0) {
        return badRequest(res, 'ID location non valido');
      }

      const availableLocations = await LocationModel.getCapacityAndDate(data, invitati);
      selectedLocation = availableLocations.find(
        (loc) => Number(loc.id) === idLocation
      );

      if (!selectedLocation) {
        return conflict(res, 'Location non disponibile per data o capienza');
      }
    }

    const availableStaff = isCustomLocation
      ? await StaffModel.getAvailableForCustomLocation(data)
      : await StaffModel.getAvailableByLocationAndDate(idLocation, data);

    const selectedStaff = staffIds.map((id) =>
      availableStaff.find((s) => Number(s.id) === id)
    );

    if (selectedStaff.some((s) => !s)) {
      return conflict(res, 'Uno o piu membri dello staff non sono disponibili');
    }

    const prezzoTotale = selectedStaff.reduce((totale, s) => {
      const costo = Number(s.costo);
      return totale + (s.tipo === 'catering' ? costo * invitati : costo);
    }, Number(selectedLocation.costo || 0));

    req.eventCreation = {
      nome,
      data,
      invitati,
      prezzoTotale,
      emailUtente: req.user.email,
      location: selectedLocation,
      idLocation,
      customLocation: isCustomLocation,
      staffIds
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = eventCreationMiddleware;