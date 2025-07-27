const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔐 Auth header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ Sem header Authorization');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Token extraído:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.log('❌ Token não encontrado no header');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      console.log('✅ Token válido para usuário:', decoded.email);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.log('❌ Token inválido:', jwtError.message);
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return res.status(401).json({ message: 'Erro na autenticação' });
  }
};

module.exports = { authenticateToken }; 