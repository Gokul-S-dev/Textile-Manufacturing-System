export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const internalStaffRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'FACTORY_MANAGER',
      'PRODUCTION_MANAGER',
      'STORE_MANAGER',
      'QUALITY_INSPECTOR',
      'ACCOUNTANT',
      'INVENTORY_MANAGER',
      'STORE_STAFF',
    ];

    if (
      req.user.roles?.includes('SUPER_ADMIN') ||
      req.user.roles?.includes('ADMIN') ||
      req.user.permissions.includes('*') ||
      req.user.permissions.includes(requiredPermission) ||
      (requiredPermission === 'analytics.read' && req.user.roles?.some((r) => internalStaffRoles.includes(r)))
    ) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

