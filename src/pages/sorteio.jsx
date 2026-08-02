import { useState } from 'react';
import { prisma } from '@/lib/prisma';

function encontrarGanhadorPago(numeroSorteadoFederal, ordens) {
  let cotasPlanas = [];

  ordens.forEach(ordem => {
    const nomeCliente = ordem.name || ordem.clientName || 'Cliente';
    const telefoneCliente = ordem.phone || ordem.clientPhone || 'Não informado';
    let listaNumeros = ordem.numbers || ordem.cotas || [];

    if (typeof listaNumeros === 'string') {
      listaNumeros = listaNumeros.split(',');
    }

    if (Array.isArray(listaNumeros)) {
      listaNumeros.forEach(num => {
        const numeroLimpo = String(num).replace(/[^0-9]/g, '');
        if (numeroLimpo.length > 0) {
          cotasPlanas.push({ 
            numero: Number(numeroLimpo), 
            nome: nomeCliente, 
            telefone: telefoneCliente 
          });
        }
      });
    }
  });

  const cotasOrdenadas = cotasPlanas
    .map(c => c.numero)
    .sort((a, b) => a - b);

  if (cotasOrdenadas.length === 0) {
    return { erro: "Nenhuma cota foi encontrada nos pedidos!" };
  }

  const sorteado = Number(numeroSorteadoFederal);

  // 1. Sorteio Direto
  if (cotasOrdenadas.includes(sorteado)) {
    const comprador = cotasPlanas.find(c => c.numero === sorteado);
    return { cota: sorteado, cliente: comprador, tipo: "🏆 Direto (1º Prêmio da Federal)" };
  }

  // 2. Aproximação para CIMA
  const proximaAcima = cotasOrdenadas.find(num => num > sorteado);
  if (proximaAcima !== undefined) {
    const comprador = cotasPlanas.find(c => c.numero === proximaAcima);
    return { cota: proximaAcima, cliente: comprador, tipo: "🔺 Aproximação para Cima (Sucessora)" };
  }

  // 3. Aproximação para BAIXO
  const proximaAbaixo = [...cotasOrdenadas].reverse().find(num => num < sorteado);
  const comprador = cotasPlanas.find(c => c.numero === proximaAbaixo);
  return { cota: proximaAbaixo, cliente: comprador, tipo: "🔻 Aproximação para Baixo (Antecessora)" };
}

export default function SorteioPage({ pedidosIniciais }) {
  const [numeroFederal, setNumeroFederal] = useState('');
  const [resultado, setResultado] = useState(null);
  const [pedidosPagos] = useState(pedidosIniciais || []);

  const handleCalcularGanhador = () => {
    if (!numeroFederal) return alert('Digite o número sorteado na Loteria Federal!');
    
    if (pedidosPagos.length === 0) {
      return alert('Nenhum pedido foi encontrado no banco de dados.');
    }

    const ganhador = encontrarGanhadorPago(numeroFederal, pedidosPagos);
    setResultado(ganhador);
  };

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', padding: '30px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px' }}>
        
        <h1 style={{ fontSize: '1.4rem', color: '#f59e0b', textAlign: 'center', marginBottom: '8px' }}>
          🎲 Painel de Apuração do Sorteio
        </h1>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#22c55e', marginBottom: '20px' }}>
          ✅ {pedidosPagos.length} pedido(s) do banco prontos para apuração!
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
            Digite o 1º Prêmio da Loteria Federal:
          </label>
          <input 
            type="number" 
            placeholder="Ex: 932415" 
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

export async function getServerSideProps() {
  try {
    let pedidos = [];
    
    if (prisma && prisma.participant) {
      pedidos = await prisma.participant.findMany();
    } else if (prisma && prisma.order) {
      pedidos = await prisma.order.findMany();
    }

    const pedidosFormatados = JSON.parse(JSON.stringify(pedidos));

    return {
      props: {
        pedidosIniciais: pedidosFormatados,
      },
    };
  } catch (error) {
    console.error("Erro no getServerSideProps:", error);
    return {
      props: {
        pedidosIniciais: [],
      },
    };
  }
}