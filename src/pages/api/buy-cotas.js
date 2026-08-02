import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, qty, tickets_count, quantity, cpf } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const cleanCpf = String(cpf || '11111111111').replace(/\D/g, '');

  if (!name || !cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Nome e telefone válidos são obrigatórios.' });
  }

  const totalQty = Number(qty || tickets_count || quantity || 1);
  const unitPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE) || 0.06;
  const totalPrice = parseFloat((totalQty * unitPrice).toFixed(2));

  // Gera as cotas únicas para o comprador
  const generatedNumbers = [];
  for (let i = 0; i < totalQty; i++) {
    generatedNumbers.push(String(Math.floor(100000 + Math.random() * 900000)));
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || 'APP_USR-262874679746832-073107-da4bdec70c57cb8f045cdb4dc6974eaf-1094025176';

  try {
    const firstName = name.trim().split(' ')[0];
    const lastName = name.trim().split(' ').slice(1).join(' ') || 'Cliente';

    // 1. Faz a chamada ao Mercado Pago com tratamento de erros aprimorado
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
      console.error('Erro detalhado Mercado Pago:', mpData);
      return res.status(400).json({
        success: false,
        message: mpData.message || mpData.cause?.[0]?.description || 'Erro ao comunicar com Mercado Pago.'
      });
    }

    const transactionData = mpData.point_of_interaction.transaction_data;
    const pixCode = transactionData.qr_code;
    const qrCodeBase64 = transactionData.qr_code_base64;
    const paymentId = String(mpData.id);

    // 2. Tenta criar no banco sem forçar a sobrescrita do ID
    let newOrder;
    try {
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
    } catch (dbError) {
      console.warn('Fallback para inserção no banco:', dbError.message);
      // Caso o 'id' no Prisma seja gerado automaticamente (Auto-Increment / UUID)
      newOrder = await prisma.order.create({
        data: {
          name: name.trim(),
          phone: cleanPhone,
          ticketsCount: totalQty,
          totalPrice: totalPrice,
          numbers: generatedNumbers,
          status: 'pending'
        }
      });
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
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao processar a cota.', 
      details: error.message 
    });
  }
}