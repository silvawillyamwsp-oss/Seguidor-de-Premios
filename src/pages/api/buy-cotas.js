import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { name, phone, qty, tickets_count, quantity, cpf } = req.body || {};
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanCpf = String(cpf || '11111111111').replace(/\D/g, '');

    if (!name || !cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Nome e telefone válidos são obrigatórios.' });
    }

    const totalQty = Number(qty || tickets_count || quantity || 1);
    const unitPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE) || 0.06;
    let totalPrice = parseFloat((totalQty * unitPrice).toFixed(2));

    if (totalPrice < 0.50) {
      totalPrice = 0.50;
    }

    const generatedNumbers = [];
    for (let i = 0; i < totalQty; i++) {
      generatedNumbers.push(String(Math.floor(100000 + Math.random() * 900000)));
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

    const firstName = name.trim().split(' ')[0];
    const lastName = name.trim().split(' ').slice(1).join(' ') || 'Cliente';

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
          email: 'contato@seguidordepremios.com.br',
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: cleanCpf.length === 11 ? cleanCpf : '11111111111'
          }
        }
      })
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok || !mpData.point_of_interaction) {
      console.error('Erro Mercado Pago:', mpData);
      return res.status(400).json({
        success: false,
        message: mpData.message || mpData.cause?.[0]?.description || 'Erro ao gerar Pix no Mercado Pago.'
      });
    }

    const transactionData = mpData.point_of_interaction.transaction_data;
    const pixCode = transactionData.qr_code;
    const qrCodeBase64 = transactionData.qr_code_base64;
    const paymentId = String(mpData.id);

    let newOrder = null;
    try {
      if (prisma && prisma.order) {
        newOrder = await prisma.order.create({
          data: {
            id: paymentId,
            name: name.trim(),
            phone: cleanPhone,
            ticketsCount: totalQty,
            totalPrice: totalPrice,
            numbers: generatedNumbers,
            status: 'pending'
          }
        });
      }
    } catch (dbError) {
      console.warn('Alerta banco de dados ao criar ordem:', dbError.message);
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
    console.error('Erro de servidor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno no servidor.', 
      details: error.message 
    });
  }
}