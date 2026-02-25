const path = require('path');
const fs   = require('fs');

const appData   = process.env.APPDATA;
const storePath = path.join(appData, 'sb-food', 'sbfood-license.json');
const hiddenPath = path.join(appData, '.sbfood');

if (fs.existsSync(storePath)) {
  fs.unlinkSync(storePath);
  console.log('✅ Licencia eliminada:', storePath);
} else {
  console.log('ℹ️ No existe:', storePath);
}

if (fs.existsSync(hiddenPath)) {
  fs.rmSync(hiddenPath, { recursive: true });
  console.log('✅ Archivo oculto eliminado');
}

console.log('🗑️ Reset completo');
