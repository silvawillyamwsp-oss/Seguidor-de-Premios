import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, qty, tickets_count, quantity } = req.body;

  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!name || !cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Nome e telefone válidos são obrigatórios.' });
  }

  const totalQty = Number(qty || tickets_count || quantity || 1);
  const unitPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE) || 0.06;
  const totalPrice = parseFloat((totalQty * unitPrice).toFixed(2));

  // Gera cotas para o comprador
  const generatedNumbers = [];
  for (let i = 0; i < totalQty; i++) {
    generatedNumbers.push(String(Math.floor(100000 + Math.random() * 900000)));
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-262874679746832-073107-da4bdec70c57cb8f045cdb4dc6974eaf-1094025176';

  try {
    // Chamada oficial à API do Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify({
        transaction_amount: totalPrice,
        description: `Cotas Seguidor de Prêmios - ${totalQty} cotas`,
        payment_method_id: 'pix',
        payer: {
          email: `${cleanPhone}@seguidordepremios.com.br`,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || 'Cliente'
        }
      })
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok || !mpData.point_of_interaction) {
      console.error('Erro na resposta do Mercado Pago:', mpData);
      return res.status(400).json({
        success: false,
        message: mpData.message || 'Erro ao gerar o Pix com o Mercado Pago.'
      });
    }

    const transactionData = mpData.point_of_interaction.transaction_data;
    const pixCode = transactionData.qr_code;
    const qrCodeBase64 = transactionData.qr_code_base64;
    const paymentId = mpData.id;

    // Estrutura do novo pedido
    const newOrder = {
      id: String(paymentId),
      name: name.trim(),
      phone: cleanPhone,
      tickets_count: totalQty,
      total_price: totalPrice,
      numbers: generatedNumbers,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Salva o pedido no banco/JSON local
    try {
      let orders = [];
      if (fs.existsSync(dataFilePath)) {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        orders = JSON.parse(fileData || '[]');
      }
      orders.push(newOrder);
      fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (err) {
      console.warn('Registro local falhou (sem efeito no Pix):', err);
    }

    return res.status(200).json({
      success: true,
      pixCode: pixCode,
      pix_code: pixCode,
      qrCodeBase64: qrCodeBase64,
      paymentId: paymentId,
      allocatedNumbers: generatedNumbers,
      numbers: generatedNumbers,
      order: newOrder
    });

  } catch (error) {
    console.error('Erro de servidor ao gerar Pix:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao comunicar com o gateway Pix.' });
  }
}