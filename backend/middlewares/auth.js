const { User } = require('../models');
const jwt = require('../services/jwt');

module.exports = async (req, res, next) => {
  console.log('Auth middleware called, path:', req.path, 'method:', req.method);
  
  if (req.headers.authorization) {
    // eslint-disable-next-line no-unused-vars
    const [_, token] = req.headers.authorization.split(' ');
    console.log('Token found in authorization header');
    
    try {
      const userPayload = await jwt.isValid(token);
      console.log('Token is valid, userPayload:', userPayload);
      
      const user = await User.findOne({ where: { email: userPayload?.data?.email } });
      console.log('User found:', user ? user.email : 'No user found');
      
      req.user = user;
      next();
      return null;
    } catch (err) {
      console.error('Auth error:', err.message);
      res.status(401).send({message: 'user not allowed! you should clear your localstorage and retry!'});
      return null;
    }
  } else {
    console.log('No authorization header found');
  }
  
  next();
  return null;
};
