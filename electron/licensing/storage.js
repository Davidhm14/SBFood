const Store = require('electron-store');
const path = require('path');
const fs = require('fs');

const store = new Store({
  name: 'sbfood-license',
  encryptionKey: process.env.STORAGE_ENCRYPTION_KEY,
});


const appDataPath = process.env.APPDATA || process.env.HOME;
const hiddenFile = path.join(appDataPath, '.sbfood', '.lic');

function ensureHiddenDir() {
  const dir = path.dirname(hiddenFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = {
  get: (key) => store.get(key),
  set: (key, value) => {
    store.set(key, value);
    // También guarda en archivo oculto
    try {
      ensureHiddenDir();
      const data = fs.existsSync(hiddenFile)
        ? JSON.parse(fs.readFileSync(hiddenFile, 'utf8'))
        : {};
      data[key] = value;
      fs.writeFileSync(hiddenFile, JSON.stringify(data), 'utf8');
    } catch (e) {}
  },
  getFromFile: (key) => {
    try {
      if (!fs.existsSync(hiddenFile)) return null;
      const data = JSON.parse(fs.readFileSync(hiddenFile, 'utf8'));
      return data[key] || null;
    } catch (e) { return null; }
  },
  clear: () => {
    store.clear();
    try { if (fs.existsSync(hiddenFile)) fs.unlinkSync(hiddenFile); } catch (e) {}
  }
};

module.exports = storage;
