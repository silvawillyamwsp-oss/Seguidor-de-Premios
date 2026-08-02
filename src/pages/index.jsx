import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Lista com 200 nomes de compradores fictícios
const NAMES_LIST = [
  "Lucas", "Mateus", "Gabriel", "Pedro", "Guilherme", "Gustavo", "Felipe", "João", "Enzo", "Thiago",
  "Rodrigo", "Bruno", "Leonardo", "Eduardo", "Diego", "Rafael", "Daniel", "Marcelo", "Alexandre", "Caio",
  "Vinicius", "Vitor", "Marcos", "Leandro", "Henrique", "Fernando", "André", "Renan", "Igor", "Murilo",
  "Samuel", "Matheus", "Arthur", "Bernardo", "Heitor", "Davi", "Lorenzo", "Theo", "Benjamin",
  "Nicholas", "Pietro", "Bryan", "Gael", "Joaquim", "Luan", "Yuri", "Sophia", "Alice", "Julia",
  "Isabella", "Manuela", "Laura", "Luiza", "Valentina", "Giovanna", "Maria", "Beatriz", "Mariana", "Lara",
  "Ana", "Sofia", "Carolina", "Camila", "Larissa", "Amanda", "Leticia", "Gabriela", "Bruna", "Jessica",
  "Thais", "Fernanda", "Vanessa", "Aline", "Natália", "Bianca", "Renata", "Patricia", "Priscila", "Luciana",
  "Juliana", "Adriana", "Carla", "Daniela", "Monique", "Rafaela", "Jaqueline", "Tainá", "Sabrina", "Rayssa",
  "Rebeca", "Nicole", "Yasmin", "Lorena", "Isadora", "Erick", "Breno", "Kaio", "Kauan", "Cauã",
  "Ruan", "Wesley", "Danilo", "Willian", "Cleiton", "Everton", "Robson", "Ailton", "Edson", "Claudinei",
  "Anderson", "Cristiano", "Marcio", "Sandro", "Valdir", "Sergio", "Paulo", "Carlos", "Roberto", "Jose",
  "Antonio", "Francisco", "Luiz", "Manoel", "Raimundo", "Vicente", "Sebastião", "Geraldo", "Benedito", "Joaquim",
  "Edivan", "Edivaldo", "Valter", "Ademir", "Fabio", "Fabiano", "Fabrice", "Everson", "Jeferson", "Ronaldo",
  "Edilson", "Adalberto", "Hamilton", "Gilberto", "Douglas", "Denis", "Denilson", "Wagner", "Wellington", "Wanderley",
  "Jefferson", "Alison", "Alan", "Alex", "Mirella", "Milena", "Stefany", "Evelyn", "Nayara", "Tamires",
  "Andressa", "Paloma", "Gessica", "Mayara", "Brenda", "Deborah", "Ingrid", "Emanuelle", "Clarice", "Cecilia",
  "Ester", "Helena", "Eloá", "Antonella", "Maitê", "Liz", "Ayla", "Maya", "Aurora", "Iris",
  "Isis", "Livia", "Melina", "Melissa", "Alana", "Clarissa", "Agatha", "Kare", "Catarina", "Elisa",
  "Heloisa", "Pietra", "Lavinia"
];

export default function Home() {
  const router = useRouter();
  const [selectedQty, setSelectedQty] = useState(10);
  const [phone, setPhone] = useState('');

  // Lista dinâmica das últimas compras
  const [recentPurchases, setRecentPurchases] = useState([
    { id: 1, name: 'Marcelo', cotas: 20, isNew: false },
    { id: 2, name: 'Juliana', cotas: 15, isNew: false },
    { id: 3, name: 'Rafael', cotas: 30, isNew: false },
    { id: 4, name: 'Fernanda', cotas: 10, isNew: false },
  ]);

  // Efeito para adicionar novas compras dinamicamente a cada 2 a 3.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const randomName = NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)];
      const possibleCotas = [5, 10, 15, 20, 25, 30, 50, 100];
      const randomCotas = possibleCotas[Math.floor(Math.random() * possibleCotas.length)];

      const newPurchase = {
        id: Date.now(),
        name: randomName,
        cotas: randomCotas,
        isNew: true
      };

      setRecentPurchases((prev) => [newPurchase, ...prev.slice(0, 3)]);
    }, Math.floor(Math.random() * 1500) + 2000);

    return () => clearInterval(interval);
  }, []);

  const pricePerUnit = 0.06;
  const totalPrice = (selectedQty * pricePerUnit).toFixed(2);

  const handleAddQty = (amount) => {
    setSelectedQty((prev) => Math.max(1, prev + amount));
  };

  const handleCheckout = () => {
    if (selectedQty <= 0) return alert('Selecione ao menos 1 cota.');
    router.push({
      pathname: '/checkout',
      query: { qty: selectedQty, phone }
    });
  };

  const topCompradores = [
    { rank: '1.', name: 'Ana', cotas: '320 Cotas', badge: '🥇' },
    { rank: '2.', name: 'Carlos', cotas: '210 Cotas', badge: '🥈' },
    { rank: '3.', name: 'Pedro', cotas: '180 Cotas', badge: '🥉' },
  ];

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>
      
      {/* Estilo Global para Animações */}
      <style jsx global>{`
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(-10px);
            background-color: rgba(34, 197, 94, 0.25);
          }
          50% {
            background-color: rgba(34, 197, 94, 0.15);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            background-color: transparent;
          }
        }
        .animate-purchase {
          animation: fadeInSlide 0.6s ease-out forwards;
        }

        /* Animação Pulsante para o Banner Bônus */
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 22px rgba(245, 158, 11, 0.85);
            transform: scale(1.015);
          }
          100% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
            transform: scale(1);
          }
        }
        .bonus-banner-container {
          margin-bottom: 20px;
          width: 100%;
          border-radius: 16px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
          padding: 2px;
          animation: pulseGlow 1.8s infinite ease-in-out;
          box-sizing: border-box;
        }
        .bonus-banner-content {
          background-color: #0f172a;
          border-radius: 14px;
          padding: 12px 14px;
          text-align: center;
        }
        .bonus-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fbbf24;
          font-weight: 900;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .bonus-banner-content p {
          color: #e2e8f0;
          font-size: 0.8rem;
          margin: 6px 0;
          line-height: 1.4;
        }
        .highlight-bonus {
          color: #22c55e;
          font-weight: 900;
          font-size: 0.95rem;
        }
        .bonus-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: #fcd34d;
          font-weight: 700;
          margin-top: 2px;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          background-color: #22c55e;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>

      {/* Top Bar Header com Atalho Meus Números */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Logo do Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/images/logo.jfif" 
            alt="Logo Seguidor de Sonhos" 
            style={{
              width: '71px',
              height: '71px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid #fbbf24'
            }} 
          />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '900' }}>
              SEGUIDOR
            </h1>
            <span style={{ fontSize: '0.65rem', color: '#fbbf24' }}>
              ★ DE PRÊMIOS ★
            </span>
          </div>
        </div>
        
        {/* Grupo de Botões do Topo */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => router.push('/meus-numeros')}
            style={{ 
              background: '#1e293b', 
              color: '#38bdf8', 
              border: '1px solid #334155', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            🔍 Meus Números
          </button>
          
          <a
            href="https://wa.me/5511948865981?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20a%20rifa."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            💬 Fale Conosco
          </a>
          
          {/* Botão Rifa Oficial */}
          <a
            href="https://www.instagram.com/seguidordesonhos?igsh=aW5oZHUyOHNkeTNl"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#16a34a',
              border: 'none',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            🟢 Quem somos!
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Título Principal */}
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', margin: '10px 0 16px', textTransform: 'uppercase' }}>
          CONCORRA A UM <span style={{ color: '#f59e0b' }}>IPHONE 17!</span>
        </h2>

        {/* BANNER PISCANTE DE BÔNUS (Posicionado no topo, antes da imagem do prêmio) */}
        <div className="bonus-banner-container">
          <div className="bonus-banner-content">
            <div className="bonus-title">
              <span>🎁</span>
              <span>OFERTA BÔNUS ESPECIAL</span>
              <span>🎁</span>
            </div>
            <p>
              Compre <strong style={{ color: '#fbbf24' }}>100 COTAS</strong> ou mais e ganhe <span className="highlight-bonus">+25 COTAS GRÁTIS</span>!
            </p>
            <div className="bonus-badge">
              <span className="badge-dot"></span>
              Aplicado automaticamente no Pix
            </div>
          </div>
        </div>

        {/* CAMPO DE ÚLTIMAS COMPRAS */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', marginBottom: '20px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#f59e0b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ÚLTIMAS COMPRAS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentPurchases.map((item) => (
              <div 
                key={item.id} 
                className={item.isNew ? 'animate-purchase' : ''}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '6px 10px', 
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e2e8f0' }}>
                  <strong>{item.name}</strong> comprou {item.cotas} cotas
                </span>
                <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0, marginLeft: '8px' }}>
                  agora
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Banner do Carro e Selo de Preço */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', padding: '16px', textAlign: 'center' }}>
          <img 
            src="/images/t-cross.jpeg" 
            alt="Prêmio do Sorteio"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
            }}
            style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'contain' }}
          />

          <div style={{ background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)', color: '#fff', padding: '8px 20px', borderRadius: '8px', display: 'inline-block', marginTop: '-20px', position: 'relative', zIndex: 10, boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)', border: '2px solid #ef4444' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginRight: '8px' }}>COTAS APENAS</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fef08a' }}>R$ 0,06</span>
          </div>
        </div>

        {/* Painel de Estatísticas */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px', marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', gap: '8px', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#22c55e', fontSize: '1.2rem', fontWeight: 'bold' }}>✓ 6.326</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Cotas Vendidas!</div>
            </div>
            <div>
              <div style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold' }}>👥 2.652</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Participantes</div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div style={{ background: '#334155', borderRadius: '20px', height: '24px', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)', width: '82%', height: '100%', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>82% VENDIDO</span>
            </div>
          </div>

          {/* Sorteio a Definir */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#cbd5e1' }}>SORTEIO:</span>
            <div style={{ background: '#1e293b', border: '1px solid #334155', color: '#f59e0b', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Sorteio a Definir
            </div>
          </div>

          {/* CARD DE AVISO DO MERCADO PAGO */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#fef08a', lineHeight: '1.4', fontWeight: '500' }}>
              O Mercado Pago não aceita PIX menor que <strong>R$ 0,50</strong>. Adicione mais umas cotinhas para garantir o Pix e aumentar suas chances de ganhar! 🚀
            </p>
          </div>

          {/* Seleção de Cotas */}
          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>Selecione ou adicione a quantidade de cotas:</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => handleAddQty(-10)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', width: '40px', height: '40px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>-10</button>
              <button onClick={() => handleAddQty(-1)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', width: '40px', height: '40px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>-1</button>
              
              <div style={{ background: '#0f172a', border: '1px solid #3b82f6', padding: '8px 20px', borderRadius: '8px', minWidth: '90px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#60a5fa' }}>{selectedQty}</span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8' }}>COTAS</span>
              </div>

              <button onClick={() => handleAddQty(1)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', width: '40px', height: '40px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>+1</button>
              <button onClick={() => handleAddQty(10)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', width: '40px', height: '40px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>+10</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              {[+25, +50, +100, +200].map((num) => (
                <button key={num} onClick={() => handleAddQty(num)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '8px 0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  +{num}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Garantir Cotas */}
          <button 
            onClick={handleCheckout} 
            style={{ 
              width: '100%', 
              background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)', 
              color: '#fff', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '30px', 
              fontSize: '1.2rem', 
              fontWeight: '900', 
              cursor: 'pointer', 
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
            GARANTIR MINHAS COTAS (R$ {totalPrice}) ❯
          </button>

        </div>

        {/* Tabela de Top Compradores */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#f59e0b', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🏆 TOP COMPRADORES
          </h3>
          {topCompradores.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid #1e293b' : 'none', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#f59e0b', fontWeight: 'bold', marginRight: '6px' }}>{item.rank}</span>
                <span>{item.name}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {item.cotas} {item.badge}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé Informativo e Termos de Uso */}
        <footer style={{ 
          marginTop: '30px', 
          padding: '24px 16px', 
          borderTop: '1px solid #1e293b', 
          fontSize: '0.75rem', 
          color: '#94a3b8', 
          textAlign: 'center', 
          lineHeight: '1.6' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', color: '#64748b' }}>
            <span>🛡️ Pagamento 100% Seguro</span>
            <span>🎲 Sorteio pela Loteria Federal</span>
            <span>⚡ PIX Pagamento Instantâneo</span>
          </div>

          <p style={{ marginBottom: '16px' }}>
            Este bilhete de loteria está autorizado com base na portaria AUTORIZAÇÃO LOTEP. Antes de contratar, consulte o Regulamento do produto. É proibida a venda para menores de 18 anos. Os sorteios e entrega dos prêmios serão realizados de acordo com os critérios estabelecidos neste site, nos termos seguintes: O adquirente concorrerá em todos os sorteios previstos no bilhete digital emitido, mesmo sendo contemplado em alguns deles. Ao contribuir, o titular do BILHETE Digital concorda desde já e sem ônus a utilização de seu nome, sua voz e imagem para a divulgação desta campanha social. Confira o resultado dos sorteios e as condições de participação em <strong>www.seguidordepremios.com.br</strong>
          </p>

          <p style={{ marginBottom: '12px', fontStyle: 'italic', opacity: 0.8 }}>
            Imagens meramente ilustrativas
          </p>

          <p style={{ color: '#cbd5e1', fontWeight: '500' }}>
            2026 - <strong>Seguidor de Prêmios</strong>
          </p>
        </footer>

      </div>
    </div>
  );
}