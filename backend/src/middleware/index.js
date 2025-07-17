const { authenticateToken } = require('./auth');

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
}; 