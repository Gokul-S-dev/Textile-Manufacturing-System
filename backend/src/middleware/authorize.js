export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({ message: 'User not authenticated or missing permissions' });
    }

    // Role-based access control check (fast check against JWT payload)
    const hasPermission = req.user.permissions.includes(requiredPermission);
    const isSuperAdmin = req.user.roles.includes('SUPER_ADMIN');

    if (!hasPermission && !isSuperAdmin) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};
