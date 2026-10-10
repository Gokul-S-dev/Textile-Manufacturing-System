export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({ message: 'User not authenticated or missing permissions' });
    }

    if (!req.user.permissions.includes(requiredPermission) && !req.user.roles.includes('SUPER_ADMIN')) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};
