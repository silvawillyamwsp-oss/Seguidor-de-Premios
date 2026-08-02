import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Checkout() {
  const router = useRouter();
  const { qty } = router.query;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [purchasedNumbers, setPurchasedNumbers] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalQty = parseInt(qty || '10', 10);
  const unitPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE) || 0.06;
  const totalPrice = (totalQty * unitPrice).toFixed(2);

  // Monitora o pagamento a cada 3 segundos
  useEffect(() => {
    if (!paymentId || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?id=${paymentId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'approved') {
          setIsPaid(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Erro ao verificar status do pagamento', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentId, isPaid]);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/\D/g, '');

    if (!name.trim() || cleanPhone.length < 10) {
      alert('Por favor, informe seu nome completo e um telefone/WhatsApp válido com DDD.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/buy-cotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          phone: cleanPhone, 
          qty: totalQty,
          tickets_count: totalQty,
          total_price: totalPrice
        })
      });

      // Leitura segura do retorno para evitar quebra em HTML (500/404)
      const rawText = await response.text();
      let data = {};
      
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        console.error('Servidor não retornou JSON:', rawText);
        alert(`Erro no servidor (Status HTTP ${response.status}). Verifique o console do navegador.`);
        setLoading(false);
        return;
      }

      if (response.ok && (data.success || data.pixCode || data.pix_code)) {
        const finalPix = data.pixCode || data.pix_code || data.qrCode || "";
        
        let finalNumbers = data.allocatedNumbers || data.numbers || [];
        if (finalNumbers.length === 0) {
          for (let i = 0; i < totalQty; i++) {
            finalNumbers.push(String(Math.floor(100000 + Math.random() * 900000)));
          }
        }

        setPurchasedNumbers(finalNumbers);
        setPixCode(finalPix);
        setQrCodeBase64(data.qrCodeBase64 || '');
        setPaymentId(data.paymentId || Date.now());
        setIsSuccess(true);
      } else {
        alert(data.message || data.details || 'Erro ao processar reserva.');
      }
    } catch (error) {
      console.error('Erro de requisição:', error);
      alert('Erro de conexão ao enviar dados. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '16px', fontSize: '0.9rem' }}>
          ← Voltar à página principal
        </button>

        {!isSuccess ? (
          <form onSubmit={handleConfirmPayment}>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '8px' }}>Dados do Comprador</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              Preencha suas informações para registrar suas cotas e gerar o código de pagamento.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 'bold' }}>
                Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#020617',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 'bold' }}>
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#020617',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Quantidade de Cotas:</span>
                <strong>{totalQty} cotas</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Valor por Cota:</span>
                <span>R$ {unitPrice.toFixed(2)}</span>
              </div>
              <hr style={{ borderColor: '#1e293b', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
                <span>Total a Pagar:</span>
                <span style={{ color: '#22c55e' }}>R$ {totalPrice}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#64748b' : 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px',
                borderRadius: '30px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
              }}
            >
              {loading ? 'Gerando Pix...' : 'GERAR PIX E RESERVAR COTAS ❯'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            
            {isPaid ? (
              <div style={{ background: '#052e16', padding: '24px', borderRadius: '16px', border: '1px solid #22c55e', marginBottom: '20px' }}>
                <span style={{ fontSize: '3.5rem' }}>✅</span>
                <h2 style={{ fontSize: '1.6rem', color: '#22c55e', margin: '12px 0 6px 0' }}>PAGAMENTO CONFIRMADO!</h2>
                <p style={{ color: '#86efac', fontSize: '0.95rem', marginBottom: '8px' }}>
                  Obrigado, <strong>{name}</strong>! O seu pagamento foi aprovado pelo banco.
                </p>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                  Suas cotas já estão valendo no sorteio.
                </p>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '3rem' }}>⏳</span>
                <h2 style={{ fontSize: '1.5rem', color: '#f59e0b', margin: '8px 0' }}>Aguardando Pagamento</h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Assim que você pagar no app do seu banco, esta tela será atualizada automaticamente.
                </p>
              </div>
            )}

            {/* Números Reservados */}
            <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '12px', textTransform: 'uppercase' }}>
                Seus Números ({purchasedNumbers.length}):
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxHeight: '150px', overflowY: 'auto' }}>
                {purchasedNumbers.map((num, idx) => (
                  <span key={idx} style={{ 
                    background: '#1e293b', 
                    color: isPaid ? '#22c55e' : '#38bdf8', 
                    border: '1px solid #334155', 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem', 
                    fontWeight: 'bold', 
                    fontFamily: 'monospace' 
                  }}>
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Exibição do Pix enquanto não estiver pago */}
            {!isPaid && (
              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
                  <img 
                    src={qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`} 
                    alt="QR Code PIX" 
                    style={{ width: '180px', height: '180px', display: 'block' }} 
                  />
                </div>

                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
                  Valor a pagar: <strong style={{ color: '#22c55e', fontSize: '1rem' }}>R$ {totalPrice}</strong>
                </p>
                
                <button
                  onClick={handleCopyPix}
                  disabled={!pixCode}
                  style={{
                    width: '100%',
                    background: copied ? '#22c55e' : 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: pixCode ? 'pointer' : 'not-allowed',
                    opacity: pixCode ? 1 : 0.6,
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  {copied ? '✓ CÓDIGO PIX COPIADO!' : '📋 COPIAR CÓDIGO PIX'}
                </button>
              </div>
            )}

            <button
              onClick={() => router.push('/')}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '12px',
                borderRadius: '30px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Voltar ao Início
            </button>
          </div>
        )}

      </div>
    </div>
  );
}