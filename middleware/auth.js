"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}
/** Middleware to use when they must be logged in as an Admin.
 * It will be used for companies routes to make sure that only admins can make changes to those routes.
 * If not, raises Unauthorized.
 */
function ensureIsAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin)
      throw new UnauthorizedError();
    return next();
  } catch (error) {
    return next(error);
  }
}
/** It will be used for user's routes to make sure that only admins or correct user can
 * make changes to those routes.
 * If not, raises Unauthorized.
 */
function ensureIsUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (user) {
      if (!user.isAdmin || user.username !== req.params.username) {
        throw new UnauthorizedError();
      }
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureIsUserOrAdmin,
};
