import * as usersService from './users.service.js';

export const create = async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body, req.user.id);
    res.status(201).json(user);
  } catch (error) { next(error); }
};

export const list = async (req, res, next) => {
  try {
    const users = await usersService.listUsers();
    res.status(200).json(users);
  } catch (error) { next(error); }
};

export const updateRoles = async (req, res, next) => {
  try {
    const user = await usersService.updateUserRoles(req.params.id, req.body.roles, req.user.id);
    res.status(200).json(user);
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const user = await usersService.updateUserStatus(req.params.id, req.body.isActive, req.user.id);
    res.status(200).json(user);
  } catch (error) { next(error); }
};

export const resetPassword = async (req, res, next) => {
  try {
    await usersService.adminResetPassword(req.params.id, req.body.newPassword, req.user.id);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) { next(error); }
};
