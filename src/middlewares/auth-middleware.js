// auth-middleware.js
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const authMiddleware = (req, res, next) => {
	const token = req.headers['authorization'];

	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'Acceso denegado. No token proporcionado.',
		});
	}

	if (!token.startsWith('Bearer ')) {
		return res.status(400).json({
			success: false,
			message: 'Formato de token inválido. Debe empezar con "Bearer ".',
		});
	}

	const jwtToken = token.slice(7); // Elimina 'Bearer ' del token
	try {
		const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
		req.employee = decoded;
		next();
	} catch (error) {
		logger.error(`Token inválido: ${error.message}`);
		res
			.status(401)
			.json({ success: false, message: 'Token inválido o expirado.' });
	}
};

const authorizeMiddleware = (minAccessLevel) => (req, res, next) => {
	if (req.employee.access < minAccessLevel) {
		return res.status(403).json({
			success: false,
			message: 'Acceso denegado. No tiene permisos suficientes.',
		});
	}
	next();
};

export { authMiddleware, authorizeMiddleware };