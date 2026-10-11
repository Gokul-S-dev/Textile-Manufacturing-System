export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (
      req.user.roles?.includes('SUPER_ADMIN') ||
      req.user.permissions.includes('*') ||
      req.user.permissions.includes(requiredPermission)
    ) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

