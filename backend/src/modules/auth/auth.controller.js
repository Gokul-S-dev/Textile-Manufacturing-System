import { authenticateUser, changeUserPassword } from './auth.service.js';
import { rotateRefreshToken, revokeAllUserTokens } from './token.service.js';
import prisma from '../../config/db.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authenticateUser(email, password);
    
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    const tokens = await rotateRefreshToken(refreshToken);
    
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.clearCookie('refreshToken');
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      // Find and delete specific session (simplified)
      // Note: A full implementation verifies the token first before deleting.
      res.clearCookie('refreshToken');
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await revokeAllUserTokens(req.user.id);
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, department: true, isActive: true }
    });
    res.status(200).json({ user, roles: req.user.roles, permissions: req.user.permissions });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changeUserPassword(req.user.id, currentPassword, newPassword);
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};
