const jwt = require("jsonwebtoken");
const result = require("./result");
const config = require("./config");

function myAuth(req, res, next) {
  // FIX: actively rewrite req.url to strip trailing newlines so downstream routers match it
  if (req.url.endsWith('%0A') || req.url.endsWith('\n')) {
    req.url = req.url.replace(/%0A/g, '').replace(/\n/g, '').trim();
  }

  const allowedUrls = ["/user/login", "/user/register"];
  // req.path is derived from req.url, so it will reflect the change
  const path = req.path;

  if (allowedUrls.includes(path)) {
    return next();
  } else {
    // If the url is for other then register and login we need to check the token
    const bearerToken = req.headers.authorization;
    if (bearerToken) {
      const token = bearerToken.split(" ")[1];
      try {
        //get the payload out of the fetched token
        const payload = jwt.verify(token, config.secret);
        // add the user data in the request object for the further routes
        req.u_id = payload.id; // FIXED
        req.role = payload.role;
        next();
      } catch (error) {
        res.send(result.createResult("Token is invalid"));
      }
    } else res.send(result.createResult("Token is missing"));
  }
}

module.exports = myAuth;
