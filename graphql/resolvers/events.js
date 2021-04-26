//  .populate(creator) by mongoose, it will populate any relation that knows(ref key) so it will pull those data from the respective collection. so we can use graph1ql to get those field data of the creator user. Note: mongoose won't populate recursively
//_doc is the property provided by the mongoose which will leave out all the meta data from the result object and only provide the core data
const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');
  
module.exports = {
    events: async () => {
      try {
        const events = await Event.find();
        return events.map(event => {
          return transformEvent(event);
        });
      } catch (err) {
        throw err;
      }
    },
    createEvent: async (args,req) => {// in the Resolver we get access to the 2nd argument request. (NOTE)
      if(!req.isAuth){
        throw new Error('Unauthenticated!');
      }
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: req.userId
      });
      let createdEvent;
      try {
        const result = await event.save();
        createdEvent = transformEvent(result);
        const creator = await User.findById(req.userId);
  
        if (!creator) {
          throw new Error('User not found.');
        }
        creator.createdEvents.push(event);
        await creator.save();//This won't create a new user. it will only update the user.
  
        return createdEvent;
      } catch (err) {                 
        console.log(err);
        throw err;// throw the error, so that express-graphql can handle it and return as the error.
      }
    }
  };

  