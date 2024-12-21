/**
 * Middleware to handle role-based authorization.
 * @param {...string} roles - Roles allowed to access the route.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is one of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
