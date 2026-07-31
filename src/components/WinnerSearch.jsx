export default function WinnerSearch() {
  return (
    <div className="card">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🔍 Encontre e Ganhe</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>Digite seu número de telefone para buscar seus títulos comprados.</p>
      <input 
        type="text" 
        placeholder="(00) 00000-0000" 
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #243044', background: '#0b0f17', color: '#fff', marginBottom: '10px' }}
      />
      <button className="btn-blue" style={{ background: '#10b981' }}>Buscar Meus Títulos</button>
    </div>
  );
}