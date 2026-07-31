import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [data, setData] = useState({ totalTickets: 0, totalRevenue: 0, participants: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado da pesquisa
  const [selectedNumbers, setSelectedNumbers] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleLogout = () => {
    router.push('/admin/login');
  };

  const handleOpenNumbers = (item) => {
    setSelectedName(item.name || 'Comprador');
    setSelectedNumbers(item.numbers || []);
  };

  const handleCloseModal = () => {
    setSelectedNumbers(null);
    setSelectedName('');
  };

  // Lógica de busca: Filtra por nome, telefone ou se o array de números contém a cota digitada
  const filteredParticipants = data.participants.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const matchesName = (item.name || '').toLowerCase().includes(term);
    const matchesPhone = (item.phone || '').includes(term);
    const matchesTicket = (item.numbers || []).some(num => num.includes(term));

    return matchesName || matchesPhone || matchesTicket;
  });

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>Painel de Administração</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Seguidor de Prêmios — Acompanhamento de Vendas</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando dados das vendas...</p>
      ) : (
        <>
          {/* CARDS RESUMO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Cotas Vendidas</span>
              <h2 style={{ fontSize: '2.2rem', margin: '8px 0 0', color: '#38bdf8', fontWeight: '900' }}>
                {data.totalTickets} <span style={{ fontSize: '1rem', color: '#64748b' }}>cotas</span>
              </h2>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Arrecadação Total</span>
              <h2 style={{ fontSize: '2.2rem', margin: '8px 0 0', color: '#4ade80', fontWeight: '900' }}>
                {data.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h2>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Compradores</span>
              <h2 style={{ fontSize: '2.2rem', margin: '8px 0 0', color: '#facc15', fontWeight: '900' }}>
                {data.participants.length} <span style={{ fontSize: '1rem', color: '#64748b' }}>pessoas</span>
              </h2>
            </div>

          </div>

          {/* TABELA DE COMPRADORES */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Lista de Compradores</h3>

              {/* CAMPO DE PESQUISA POR COTA / NOME / TELEFONE */}
              <input
                type="text"
                placeholder="🔎 Buscar por Nº da Cota, Nome ou Telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#020617',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  minWidth: '300px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            {filteredParticipants.length === 0 ? (
              <p style={{ color: '#64748b', margin: '16px 0 0' }}>
                {searchTerm ? `Nenhum resultado encontrado para "${searchTerm}".` : 'Nenhuma compra registrada até o momento.'}
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>NOME</th>
                      <th style={{ padding: '12px' }}>TELEFONE / WHATSAPP</th>
                      <th style={{ padding: '12px' }}>COTAS (CLIQUE P/ VER)</th>
                      <th style={{ padding: '12px' }}>VALOR PAGO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.95rem' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>{item.name || 'Não informado'}</td>
                        <td style={{ padding: '14px 12px', color: '#38bdf8' }}>{item.phone}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <button
                            onClick={() => handleOpenNumbers(item)}
                            style={{
                              background: '#1e293b',
                              color: '#38bdf8',
                              border: '1px solid #3b82f6',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            🔍 {item.tickets_count} cota(s)
                          </button>
                        </td>
                        <td style={{ padding: '14px 12px', color: '#4ade80', fontWeight: 'bold' }}>
                          {Number(item.total_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL DE EXIBIÇÃO DAS COTAS */}
      {selectedNumbers && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 9999
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#fff' }}>
              Cotas de: <span style={{ color: '#38bdf8' }}>{selectedName}</span>
            </h3>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
              Total: {selectedNumbers.length} cota(s)
            </p>

            {/* LISTA DE NÚMEROS */}
            <div style={{
              overflowY: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '12px',
              background: '#020617',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px',
              maxHeight: '300px'
            }}>
              {selectedNumbers.length > 0 ? (
                selectedNumbers.map((num, i) => (
                  <span key={i} style={{
                    background: '#0284c7',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {num}
                  </span>
                ))
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhum número cadastrado nesta compra.</span>
              )}
            </div>

            <button
              onClick={handleCloseModal}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}