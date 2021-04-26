const jwt = require('jsonwebtoken');
// Here we have a middleware which will check whether we have a valid token or not. But it doesn't ever throw an error, instead it just sets some extra data in the incomming request in isAuth and the userId if authenticated(which can be used later) 
module.exports = (req,res,next) => {
    const authHeader = req.get('Authorization') //Returns the specified HTTP request header field.(Aliased as req.header(field).)
    if(!authHeader){
        req.isAuth = false;
        return next();//return so that anyother below won't get run
    }
const token = authHeader.split(' ')[1];
if(!token || token === ''){
    req.isAuth = false;
        return next();
    }
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,"some secretkey");

    }catch(err){
        req.isAuth = false;
        return next();
    }
    if(!decodedToken){
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
}

//How to use this middleware to protect our induvidual resolvers.
// with REST it was simple, on all routes we could add or not add the auth Middleware.
// But for Graphql we only have a route '/graphql' so we could add the middleware to lock the entire /graphql. so that's the reason why we are only just setting isAuth. 