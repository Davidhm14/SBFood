const crypto = require('crypto');
require('dotenv').config();

const SECRET_KEY = process.env.LICENSE_SECRET_KEY;

const serial = {
 
validate(serialInput) {
  try {
    const clean = serialInput.trim(); 
    const parts = clean.split('-');

    if (parts.length < 3 || parts[0] !== 'SBF') {
      return { valid: false, message: 'Formato de serial inválido' };
    }

    const hash    = parts[parts.length - 1].toUpperCase(); // solo el hash va en mayúsculas
    const encoded = parts.slice(1, parts.length - 1).join('-'); // base64 respeta mayúsculas/minúsculas

    const payload = Buffer.from(encoded, 'base64').toString('utf8');

    const expectedHash = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payload)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();

    if (hash !== expectedHash) {
      return { valid: false, message: 'Serial inválido o alterado' };
    }

    const [type, expiryDate] = payload.split('|');

    if (type !== 'lifetime' && new Date(expiryDate) < new Date()) {
      return { valid: false, message: 'Este serial ha expirado' };
    }

    return { valid: true, type, expiryDate };

  } catch (e) {
    return { valid: false, message: 'Error al procesar el serial' };
  }
}
}

module.exports = serial;
