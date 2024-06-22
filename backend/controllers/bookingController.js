const Booking = require('../models/bookingModel');
const { BR_AUDI, RAJ_SOIN, SPS_13 } = require('../constants');
const Soc = require('../models/socModel');

const fetchBookedSlots = async (req, res) => {
  try {
    const { venue, date } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    if (!venue) {
      const bookedSlots = await Booking.find({ date });
      return res
        .status(200)
        .json({ result: bookedSlots, message: 'Slots fetched successfully' });
    }
    const bookedSlots = await Booking.find({ venue, date });
    return res
      .status(200)
      .json({ result: bookedSlots, message: 'Slots fetched successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const fetchBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json({ result: booking, message: 'Booking fetched successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const handleSlotBooking = async (req, res) => {
  try {
    const { soc, title, slots, date, venue, details } = req.body;
    let files = req.files.map(file => file.path.replace("public","")); 

    console.log(req.files)
    console.log(files)

   

    
    if (slots.length === 0) {
      return res.status(400).json({ error: 'Slots must be a non-empty array' });
    }
    const slotsArray = Array.isArray(slots) ? slots : [slots];
    console.log(slotsArray)
    
    const isAvailable = await Booking.findOne({
      venue,
      date,
      slots: { $in: slots },
    });

    let organizer = await Soc.findById(soc);
    organizer = organizer.name;

    if (!isAvailable) {
      const newBooking = await Booking.create({
        soc,
        title,
        slots:slotsArray,
        date,
        venue,
        organizer,
        details,
        file: files,
      });

      return res.status(201).json({
        result: newBooking,
        message: 'Slot request for the given venue raised successfully',
      });
    } else {
      return res.status(400).json({
        error: 'Requested slot is already booked',
        bookedSlotDetails: isAvailable,
      });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err});
  }
}
const deleteBookedSlot = async (req, res) => {
  try {
    const { id } = req.params; 
    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking deleted successfully', deletedBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { fetchBookedSlots, handleSlotBooking, deleteBookedSlot ,fetchBookingById};