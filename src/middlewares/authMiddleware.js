import jwt from 'jsonwebtoken';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors.js';

/*
Example usage:
import { checkAuth, checkPlan, checkRole } from '../middlewares/authMiddelwares.js';

router.get('/v1/itineraries', checkAuth(), checkPlan('advanced'), checkRole('admin'), itineraryController.getAllItineraries);
*/


//WARNING ==============================
// checkAuth is needed allways before other checks

export function checkAuth() {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Removes 'Bearer ' from the token

    if (!token) {
      logger.debug('No token provided');
      return next(new UnauthorizedError('No token provided'));
    }
    logger.debug(`Token was provided: ${token}`);
    logger.debug(`JWT secret: ${config.jwtSecret}`);
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        logger.debug(`Failed to authenticate token: ${err.message}`);
        return next(new UnauthorizedError('Failed to authenticate token'));
      }

      req.user = decoded.user;
      logger.debug(`JWT payload: ${JSON.stringify(decoded)}`);
      next();
    });
  };
};

// Middleware to check if the user has one of the allowed plans
const plans = {
  basic: ['basic', 'advanced', 'pro'], // Basic url can be accessed by all plans
  advanced: ['advanced', 'pro'], // Advanced url can be accessed by advanced and pro plans
  pro: ['pro'], // Pro url can be accessed by pro plan
};
export function checkPlan(plan) {
  return (req, res, next) => {

    if (!req.user?.plan) {
      logger.debug('No plan provided');
      return next(new ForbiddenError('No plan provided'));
    }

    const allowedPlans = plans[plan];
    logger.debug(`Allowed plans for ${plan}: ${allowedPlans}`);
    logger.debug(`User plan: ${req.user.plan}`);
    if (!allowedPlans.includes(req.user.plan)) {
      logger.debug(`Insufficient plan: required one of ${allowedPlans}, but got ${req.user.plan}`);
      return next(new ForbiddenError(`Insufficient plan: required one of ${allowedPlans}, but got ${req.user.plan}`));
    }
    next();
  };
}

// Middleware to check if the user has one of the required roles
const roles = {
  user: ['user', 'admin'], // User role can be accessed by user and admin roles
  admin: ['admin'], // Admin role can be accessed by admin role
};

export function checkRole(role) {
  return (req, res, next) => {

    if (!req.user?.roles) {
      logger.debug('No roles provided');
      return next(new ForbiddenError('No roles provided'));
    }

    const allowedRoles = roles[role];
    logger.debug(`Allowed roles for ${role}: ${allowedRoles}`);
    logger.debug(`User roles: ${req.user.roles}`);

    const hasRequiredRole = req.user.roles.some(userRole => allowedRoles.includes(userRole));
    if (!hasRequiredRole) {
      logger.debug(`Insufficient role: required one of ${allowedRoles}, but got ${req.user.roles}`);
      return next(new ForbiddenError(`Insufficient role: required one of ${allowedRoles}, but got ${req.user.roles}`));
    }
    next();
  };
}

// Middleware to check if the user has a specific addon
export function checkAddon(addon) {
  return (req, res, next) => {
    if (!req.user?.addons) {
      logger.debug('No addons provided');
      return next(new ForbiddenError('No addons provided'));
    }
    logger.debug(`Required addon: ${addon}`);
    logger.debug(`User addons: ${req.user.addons}`);
    // if has addon=all then return next
    if (req.user.addons.includes('all')) {
      return next();
    }


    if (!req.user.addons.includes(addon)) {
      logger.debug(`Missing required addon: ${addon}`);
      return next(new ForbiddenError(`Missing required addon: ${addon}`));
    }
    next();
  };
}


export default { checkAuth, checkPlan, checkRole, checkAddon };