const logger = require('./logger');

// Validate Bearer Token Function
module.exports = function validateBearerToken(req, res, next) {
  const myToken = process.env.MY_TOKEN;
  const authToken = req.get('Authorization');

  // If the string doesn't start with 'Bearer'
  if (!authToken.startsWith('Bearer ')) {
    // Give an error response with error message
    return res.status(400).json({ error: 'Invalid request' });
  }

  // If there is no authorization token OR if the token doesn't match
  if (!authToken || authToken.split(' ')[1] !== myToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    // Give an error response with error message
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  // If the tokens match, continue on
  next();
}