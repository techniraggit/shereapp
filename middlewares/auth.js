const jwt = require('jsonwebtoken');
// token middleware
const tokenMiddleware = (req, res, next) => {
    // get token from headers, query parameters, or cookies
    const token = req.headers.authorization;

    // check if token exists
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    // verify and decode token
    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = tokenMiddleware;