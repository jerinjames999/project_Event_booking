const Event = require('../../models/event');
const Booking = require("../../models/booking");
const {transformBooking, transformEvent  } = require("./merge");


// point at an object which has all the resolver functions in it. Note: resolver functions have to match our schema endpoints by name.
// should return this so that the express-graphql knows that this resolver executes an async operation and it will wait for the result to complete otherwise we won't get a vaild result.
module.exports = {
  bookings: async (args, req) => {
    if(!req.isAuth){
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    if(!req.isAuth){
      throw new Error('Unauthenticated!');
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent
    });
    const result = await booking.save();
    return tranfsformBooking(result);
  },
  cancelBooking: async (args, req) => {
    if(!req.isAuth){//Also while canceling, have to check whether whe cancelling person is the one who booked or not?
      throw new Error('Unauthenticated!');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};