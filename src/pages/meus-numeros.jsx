import { useState } from 'react';
import { useRouter } from 'next/router';

export default function MeusNumeros() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(false);

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 8) {
      setError('Por favor, digite um número de telefone com DDD válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/my-tickets?phone=${cleanPhone}`);
      const data = await response.json();

      setSearched(true);

      if (response.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Erro ao buscar suas cotas.');
      }
    } catch (err) {
      console.error('Erro de requisição:', err);
      setError('Erro de conexão ao buscar cotas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          ← Voltar ao Início
        </button>

        <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', marginBottom: '10px' }}>Buscar Meus Números</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.4' }}>
          Digite o telefone/WhatsApp cadastrado no momento da compra para visualizar suas cotas do <strong>Seguidor de Prêmios</strong>.
        </p>

        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 'bold' }}>
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: 11948865981"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background: '#020617',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'BUSCANDO...' : 'CONSULTAR COTAS'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Exibição dos Resultados */}
        {searched && orders.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#22c55e', marginBottom: '16px' }}>
              ✓ Encontramos {orders.length} compra(s)!
            </h3>

            {orders.map((order, idx) => (
              <div key={idx} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span>Comprador: <strong style={{ color: '#fff' }}>{order.name}</strong></span>
                  <span style={{ 
                    color: order.status === 'approved' ? '#22c55e' : '#f59e0b',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {order.status === 'approved' ? 'PAGO' : 'PENDENTE'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
                  Quantidade: <strong>{order.ticketsCount || (order.numbers || []).length} cotas</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(order.numbers || []).map((num, nIdx) => (
                    <span key={nIdx} style={{
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      fontWeight: 'bold'
                    }}>
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {searched && orders.length === 0 && !error && (
          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: '#eab308', marginBottom: '8px' }}>Nenhuma cota encontrada</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Não encontramos compras atreladas a este número. Verifique se digitou o DDD correto.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}