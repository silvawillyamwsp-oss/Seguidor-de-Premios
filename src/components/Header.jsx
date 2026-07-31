export default function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #243044', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>SEGUIDOR DE PRÊMIOS</h2>
      </div>
    </header>
  );
}