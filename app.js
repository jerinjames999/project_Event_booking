/*
If we want to handle a case where we have multiple operations on the database which usually work together, Then we can use Transations which mongodb supports
*/

const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP; //middleware
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/events");
const User = require("./models/user");

const app = express();
app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(` 
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
        events: [Event!]!
    }
    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
    }
    schema{
        query: RootQuery
        mutation: RootMutation
    }
`),
    rootValue: {
      // point at an object which has all the resolver functions in it. Note: resolver functions have to match our schema endpoints by name.
      events: () => {
        return Event.find()
          .then((events) =>
            events.map((e) => {
              return { ...e._doc };
            })
          )
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "608295871569d30950ac05a4",
        });
        let createdEvent;
        return event // should return this so that the express-graphql knows that this resolver executes an async operation and it will wait for the result to complete otherwise we won't get a vaild result.
          .save()
          .then((result) => {
            createdEvent = { ...result._doc }; //_doc is the property provided by the mongoose which will leave out all the meta data from the result object and only provide the core data
            return User.findById("608295871569d30950ac05a4");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User doesnot exist.");
            }
            user.createdEvents.push(event); // here we can pass id or even the object event, then mongoose will pull the id from the event object.
            return user.save(); //This won't create a new user. it will only update the user.
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err; // throw the error, so that express-graphql can handle it and return as the error.
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User exists already.");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    graphiql: true,
  })
);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bxcyh.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(4000, () => {
      console.log("Server Started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
