import { useState } from 'react';
import Link from 'next/link';

export default function MeusNumeros() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResults(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('Por favor, informe um número de telefone/WhatsApp válido.');
      return;
    }

    setLoading(true);

    try {
      // Faz a requisição diretamente via GET
      const res = await fetch(`/api/my-tickets?phone=${encodeURIComponent(cleanPhone)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResults(data);
      } else {
        setErrorMsg(data.message || 'Erro ao buscar cotas. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setErrorMsg('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
        
        <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
          ← Voltar ao Início
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginTop: '20px', marginBottom: '8px' }}>
          Buscar Meus Números
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.5' }}>
          Digite o telefone/WhatsApp cadastrado no momento da compra para visualizar suas cotas do <strong>Seguidor de Prêmios</strong>.
        </p>

        <form onSubmit={handleSearch} style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: '#cbd5e1' }}>
            Telefone / WhatsApp
          </label>
          <input
            type="text"
            placeholder="Ex: 11948865981"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: '#0284c7',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '900',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? 'Consultando...' : 'Consultar Cotas'}
          </button>
        </form>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        {results && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
            {results.tickets && results.tickets.length > 0 ? (
              <>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#4ade80' }}>
                  🎉 {results.tickets.length} cota(s) encontrada(s)!
                </h3>
                <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Suas cotas registradas para este número:
                </p>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  background: '#020617',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {results.tickets.map((num, i) => (
                    <span key={i} style={{
                      background: '#0284c7',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {num}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ color: '#facc15', fontWeight: 'bold', margin: '0 0 8px' }}>Nenhuma cota encontrada</p>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  Não encontramos compras associadas a esse telefone. Verifique se o número foi digitado corretamente.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}