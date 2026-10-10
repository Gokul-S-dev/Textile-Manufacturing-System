import { registerUser, authenticateUser } from './auth.service.js';

export const signup = async (req, res, next) => {
  try {
    // Validation is already handled via middleware
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', data: user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authenticateUser(email, password);
    res.status(200).json({ message: 'Login successful', token, data: user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    // The user object is injected by the authenticate middleware
    res.status(200).json({ data: req.user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // For stateless JWT, logout is handled client-side by destroying the token.
    // If refresh tokens were implemented, we would invalidate them in the DB here.
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
