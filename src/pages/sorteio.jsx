import { useState } from 'react';

// 1. A FUNÇÃO DE APURAÇÃO
function encontrarGanhadorPago(numeroSorteadoFederal, listaDeCotasPagas) {
  // Garantimos que trabalhamos apenas com números válidos e ordenados
  const cotasOrdenadas = listaDeCotasPagas
    .map(c => Number(c.numero))
    .sort((a, b) => a - b);

  if (cotasOrdenadas.length === 0) return { erro: "Nenhuma cota paga encontrada no sistema!" };

  const sorteado = Number(numeroSorteadoFederal);

  // Regra 1: Deu no número exato?
  if (cotasOrdenadas.includes(sorteado)) {
    const comprador = listaDeCotasPagas.find(c => Number(c.numero) === sorteado);
    return { cota: sorteado, cliente: comprador, tipo: "🏆 Direto (1º Prêmio da Federal)" };
  }

  // Regra 2: Busca a cota PAGA mais próxima para CIMA
  const proximaAcima = cotasOrdenadas.find(num => num > sorteado);
  if (proximaAcima !== undefined) {
    const comprador = listaDeCotasPagas.find(c => Number(c.numero) === proximaAcima);
    return { cota: proximaAcima, cliente: comprador, tipo: "🔺 Aproximação para Cima (Sucessora)" };
  }

  // Regra 3: Se não tem para cima, pega a maior para BAIXO
  const proximaAbaixo = [...cotasOrdenadas].reverse().find(num => num < sorteado);
  const comprador = listaDeCotasPagas.find(c => Number(c.numero) === proximaAbaixo);
  return { cota: proximaAbaixo, cliente: comprador, tipo: "🔻 Aproximação para Baixo (Antecessora)" };
}

export default function PainelSorteio() {
  const [numeroFederal, setNumeroFederal] = useState('');
  const [resultado, setResultado] = useState(null);

  // 2. SIMULAÇÃO OU BUSCA DAS COTAS PAGAS (Substitua depois pela chamada do seu banco de dados)
  // Exemplo de lista de cotas realmente pagas no seu banco:
  const cotasPagasDoBanco = [
    { numero: 12, nome: "Lucas Silva", telefone: "(11) 99999-1111" },
    { numero: 105, nome: "Ana Costa", telefone: "(11) 98888-2222" },
    { numero: 450, nome: "Carlos Eduardo", telefone: "(11) 97777-3333" },
    { numero: 890, nome: "Fernanda Lima", telefone: "(11) 96666-4444" },
  ];

  const handleCalcularGanhador = () => {
    if (!numeroFederal) return alert('Digite o número sorteado na Loteria Federal!');
    
    const ganhador = encontrarGanhadorPago(numeroFederal, cotasPagasDoBanco);
    setResultado(ganhador);
  };

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', padding: '30px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px' }}>
        
        <h1 style={{ fontSize: '1.4rem', color: '#f59e0b', textAlign: 'center', marginBottom: '20px' }}>
          🎲 Painel de Apuração do Sorteio
        </h1>

        {/* Campo do Resultado da Federal */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
            Digite o 1º Prêmio da Loteria Federal:
          </label>
          <input 
            type="number" 
            placeholder="Ex: 450" 
            value={numeroFederal} 
            onChange={(e) => setNumeroFederal(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: '#020617',
              border: '1px solid #334155',
              color: '#fff',
              fontSize: '1.1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Botão de Rodar Apuração */}
        <button 
          onClick={handleCalcularGanhador}
          style={{
            width: '100%',
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔍 ENCONTRAR GANHADOR PAGO
        </button>

        {/* Exibição do Resultado */}
        {resultado && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#1e293b', border: '1px solid #22c55e', borderRadius: '12px' }}>
            {resultado.erro ? (
              <p style={{ color: '#ef4444', textAlign: 'center', margin: 0 }}>{resultado.erro}</p>
            ) : (
              <>
                <span style={{ fontSize: '0.75rem', background: '#16a34a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {resultado.tipo}
                </span>
                
                <h2 style={{ fontSize: '1.8rem', color: '#fef08a', margin: '12px 0 6px' }}>
                  Cota Ganhadora: #{resultado.cota}
                </h2>

                <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>
                  <strong>Nome:</strong> {resultado.cliente?.nome}
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.95rem', color: '#38bdf8' }}>
                  <strong>Telefone:</strong> {resultado.cliente?.telefone}
                </p>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}