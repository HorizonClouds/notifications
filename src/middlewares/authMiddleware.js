export const authenticate = async (req, res, next) => {
  // Obtiene el token de la cabecera Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded.user; 
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationError('Token has expired');
        }
        throw new AuthenticationError('Invalid token');
    }
};