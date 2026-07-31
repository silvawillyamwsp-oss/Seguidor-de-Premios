export default function PrizeCard() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ background: '#243044', borderRadius: '8px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        <span style={{ color: '#94a3b8' }}>[ Foto do T-CROSS 0KM ]</span>
      </div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#60a5fa' }}>T-CROSS 0KM</h1>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Adquira seus títulos e concorra a um SUV zero quilômetro!</p>
    </div>
  );
}