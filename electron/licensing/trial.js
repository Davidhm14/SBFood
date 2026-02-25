const storage = require('./storage');

const TRIAL_DAYS = 7;

const trial = {
  // Inicializa el trial en la primera instalación
  init() {
    if (!storage.get('installDate')) {
      const installDate = new Date().toISOString();
      storage.set('installDate', installDate);
      console.log('🆕 Primera instalación detectada. Trial iniciado.');
    }
  },

  // Retorna estado actual de la licencia
  check() {
    // 1. ¿Ya está activado con serial?
    if (storage.get('activated') === true) {
      const expiryDate = storage.get('expiryDate');
      // Licencia lifetime
      if (expiryDate === 'lifetime') return { status: 'active', type: 'lifetime' };
      // Licencia con fecha
      if (new Date(expiryDate) > new Date()) {
        return { status: 'active', type: 'serial', expiryDate };
      }
      // Licencia expirada
      return { status: 'expired', type: 'serial' };
    }

    // 2. Calcular días de trial
    const installDateStr = storage.get('installDate')
      || storage.getFromFile('installDate');

    if (!installDateStr) {
      // No hay fecha: posible manipulación, reinicia
      trial.init();
      return { status: 'trial', daysLeft: TRIAL_DAYS };
    }

    const installDate = new Date(installDateStr);
    const today = new Date();
    const diffMs = today - installDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = TRIAL_DAYS - diffDays;

    if (daysLeft > 0) {
      return { status: 'trial', daysLeft };
    }

    return { status: 'expired', daysLeft: 0 };
  },

  // Activa con serial válido
  activate(serialData) {
    storage.set('activated', true);
    storage.set('expiryDate', serialData.expiryDate);
    storage.set('activatedAt', new Date().toISOString());
    return true;
  },

  getStatus() {
    return trial.check();
  }
};

module.exports = trial;
