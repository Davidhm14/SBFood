import { useState, useEffect } from 'react';

const statusConfig = {
  trial:   { color: '#f59e0b', icon: '⏳' },
  active:  { color: '#10b981', icon: '✅' },
  expired: { color: '#ef4444', icon: '🔒' },
};

export default function Activation({ onActivated }) {
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [serial, setSerial]               = useState('');
  const [message, setMessage]             = useState(null);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    checkLicense();
  }, []);

  async function checkLicense() {
    const status = await window.electronAPI.checkLicense();
    setLicenseStatus(status);

    // Si está activa, no mostramos esta pantalla
    if (status.status === 'active') onActivated?.();
  }

  async function handleActivate(e) {
    e.preventDefault();
    if (!serial.trim()) return;
    setLoading(true);
    setMessage(null);

    const result = await window.electronAPI.activateLicense(serial);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => onActivated?.(), 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  }

  if (!licenseStatus) return <div style={styles.loading}>Verificando licencia...</div>;

  const cfg = statusConfig[licenseStatus.status] || statusConfig.expired;

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo / Título */}
        <div style={styles.logo}>🍽️</div>
        <h1 style={styles.title}>SB Food</h1>
        <p style={styles.subtitle}>Sistema de Gestión de Restaurante</p>

        {/* Estado actual */}
        <div style={{ ...styles.statusBadge, borderColor: cfg.color, color: cfg.color }}>
          {cfg.icon}&nbsp;
          {licenseStatus.status === 'trial'
            ? `Período de prueba — ${licenseStatus.daysLeft} día(s) restante(s)`
            : licenseStatus.status === 'expired'
            ? 'Licencia expirada — Ingresa un serial para continuar'
            : 'Licencia activa'}
        </div>

        {/* Formulario de activación */}
        <form onSubmit={handleActivate} style={styles.form}>
          <label style={styles.label}>Serial de activación</label>
          <input
            style={styles.input}
            type="text"
            placeholder="SBF-XXXX-XXXX"
            value={serial}
            onChange={e => setSerial(e.target.value)}
            disabled={loading}
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Verificando...' : '🔓 Activar licencia'}
          </button>
        </form>

        {/* Mensaje de resultado */}
        {message && (
          <div style={{
            ...styles.message,
            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color:      message.type === 'success' ? '#065f46' : '#991b1b',
          }}>
            {message.text}
          </div>
        )}

        {/* Botón continuar si está en trial */}
        {licenseStatus.status === 'trial' && (
          <button style={styles.trialBtn} onClick={() => onActivated?.()}>
            Continuar con período de prueba →
          </button>
        )}

      </div>
    </div>
  );
}

const styles = {
  container:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  card:        { background: '#1e293b', borderRadius: 16, padding: '2.5rem', width: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  loading:     { color: '#94a3b8', textAlign: 'center', padding: '2rem' },
  logo:        { fontSize: 48, textAlign: 'center' },
  title:       { color: '#f1f5f9', textAlign: 'center', margin: '0.5rem 0 0.25rem', fontSize: 28, fontWeight: 700 },
  subtitle:    { color: '#94a3b8', textAlign: 'center', marginBottom: '1.5rem', fontSize: 13 },
  statusBadge: { border: '1.5px solid', borderRadius: 8, padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 600, marginBottom: '1.5rem', fontSize: 14 },
  form:        { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label:       { color: '#94a3b8', fontSize: 13 },
  input:       { background: '#0f172a', border: '1.5px solid #334155', borderRadius: 8, padding: '0.75rem 1rem', color: '#f1f5f9', fontSize: 15, outline: 'none' },
  button:      { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '0.85rem', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  message:     { marginTop: '1rem', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 14, fontWeight: 500 },
  trialBtn:    { marginTop: '1rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'center' },
};
