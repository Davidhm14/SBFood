const crypto = require('crypto');
require('dotenv').config();

const SECRET_KEY = process.env.LICENSE_SECRET_KEY;

function generateSerial(type = 'full', months = 12) {
  let expiryDate;

  if (type === 'lifetime') {
    expiryDate = 'lifetime';
  } else {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    expiryDate = date.toISOString().split('T')[0]; 
  }

  const payload = `${type}|${expiryDate}`;
  const encoded = Buffer.from(payload).toString('base64');
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  return `SBF-${encoded}-${hash}`;
}

// Genera seriales de ejemplo
console.log('🔑 Generador de Seriales SB Food\n');
console.log('📅 Licencia 1 mes:   ', generateSerial('full', 1));
console.log('📅 Licencia 6 meses: ', generateSerial('full', 6));
console.log('📅 Licencia 1 año:   ', generateSerial('full', 12));
console.log('♾️  Licencia lifetime:', generateSerial('lifetime'));
