const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const jwt = require('jsonwebtoken')
// point at an object which has all the resolver functions in it. Note: resolver functions have to match our schema endpoints by name.
// should return this so that the express-graphql knows that this resolver executes an async operation and it will wait for the result to complete otherwise we won't get a vaild result.
module.exports = {
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
  login: async ({email, password}) => {
    const user = await User.findOne({email: email});
    if(!user) {
      throw new Error('User doesn\'t exist!');
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if(!isEqual){
      throw new Error('Password is incorrect');
    }
    const token = jwt.sign({userId: user.id, email: user.email}, 'some secretkey',{
      expiresIn:"1h"
    });
    return {
      userId: user.id, token, tokenExpiration: 1//user.id will give the string of _id from user directly.
    }
  }
};
