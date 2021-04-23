const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};
// point at an object which has all the resolver functions in it. Note: resolver functions have to match our schema endpoints by name.
// should return this so that the express-graphql knows that this resolver executes an async operation and it will wait for the result to complete otherwise we won't get a vaild result.
module.exports = {
  events: async () => {
    try {
      const events = await Event.find(); //  .populate(creator) by mongoose, it will populate any relation that knows(ref key) so it will pull those data from the respective collection. so we can use graph1ql to get those field data of the creator user. Note: mongoose won't populate recursively
      return events.map((event) => {
        //Note the best approach(populating)
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          createdAt: new Date(Booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5c0fbd06c816781c518e4f3e",
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc, //_doc is the property provided by the mongoose which will leave out all the meta data from the result object and only provide the core data
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      };
      const creator = await User.findById("5c0fbd06c816781c518e4f3e");

      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event); // here we can pass id or even the object event, then mongoose will pull the id from the event object.
      await creator.save(); //This won't create a new user. it will only update the user.

      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err; // throw the error, so that express-graphql can handle it and return as the error.
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User exists already.");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });

      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5c0fbd06c816781c518e4f3e",
      event: fetchedEvent,
    });
    const result = await booking.save();
    return {
      ...result._doc,
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
  },
};