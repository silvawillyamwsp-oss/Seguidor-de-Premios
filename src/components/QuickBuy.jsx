export default function QuickBuy({ onSelect }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ⚡ Comprar Rápido
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>Selecione a quantidade de títulos desejada:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button className="btn-blue" onClick={() => onSelect(5)}>+5 Títulos</button>
        <button className="btn-blue" onClick={() => onSelect(50)}>+50 Títulos</button>
      </div>
    </div>
  );
}