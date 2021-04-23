const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP; //middleware
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/events");

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

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
        events: [Event!]!
    }
    type RootMutation {
        createEvent(eventInput: EventInput): Event
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
          title: args. eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });

        console.log(event);
        return event // should return this so that the express-graphql knows that this resolver executes an async operation and it will wait for the result to complete otherwise we won't get a vaild result.
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc }; //_doc is the property provided by the mongoose which will leave out all the meta data from the result object and only provide the core data
          })
          .catch((err) => {
            console.log(err);
            throw err; // throw the error, so that express-graphql can handle it and return as the error.
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
