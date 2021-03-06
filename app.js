/*
If we want to handle a case where we have multiple operations on the database which usually work together, Then we can use Transations which mongodb supports
*/

const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP; //middleware
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const isAuth = require("./middleware/is-auth");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");

const app = express();
app.use(bodyParser.json());

app.use(isAuth);

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bxcyh.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server Started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
