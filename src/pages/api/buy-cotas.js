import { MercadoPagoConfig, Payment } from 'mercadopago';
import fs from 'fs';
import path from 'path';

const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-262874679746832-073107-da4bdec70c57cb8f045cdb4dc6974eaf-1094025176' 
});

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

function getStoredOrders() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dataFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function saveOrders(orders) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Erro ao salvar pedido no arquivo:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, qty } = req.body;

  if (!qty || qty <= 0) {
    return res.status(400).json({ message: 'Quantidade inválida' });
  }

  const TOTAL_COTAS_RIFA = 1000000;
  const existingOrders = getStoredOrders();

  const usedNumbers = new Set(existingOrders.flatMap(o => o.numbers || []));
  const allocatedNumbers = [];

  while (allocatedNumbers.length < Number(qty)) {
    const randomNumber = Math.floor(Math.random() * TOTAL_COTAS_RIFA);
    const formattedNumber = String(randomNumber).padStart(6, '0');

    if (!usedNumbers.has(formattedNumber)) {
      usedNumbers.add(formattedNumber);
      allocatedNumbers.push(formattedNumber);
    }
  }

  const unitPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE) || 0.06;
  const totalPrice = Number((qty * unitPrice).toFixed(2));

  try {
    const payment = new Payment(client);

    const cleanName = (name || 'Cliente').trim();
    const nameParts = cleanName.split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Sobrenome';

    const cleanPhone = (phone || '').replace(/\D/g, '');
    const userEmail = cleanPhone.length >= 10 
      ? `cliente${cleanPhone}@gmail.com` 
      : 'contatoseguidordepremios@gmail.com';

    const paymentData = await payment.create({
      body: {
        transaction_amount: totalPrice,
        description: `Seguidor de Premios - ${qty} cotas`,
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
        },
      }
    });

    const pixData = paymentData.point_of_interaction?.transaction_data;

    if (!pixData?.qr_code) {
      throw new Error('Retorno do Mercado Pago não contém o código Pix.');
    }

    // Estrutura padronizada para o painel admin
    const newOrder = {
      id: String(paymentData.id),
      name: cleanName,
      phone: cleanPhone,
      tickets_count: Number(qty),
      total_price: totalPrice,
      numbers: allocatedNumbers,
      createdAt: new Date().toISOString()
    };

    existingOrders.unshift(newOrder);
    saveOrders(existingOrders);

    return res.status(200).json({
      success: true,
      paymentId: paymentData.id,
      allocatedNumbers,
      pixCode: pixData.qr_code,
      qrCodeBase64: pixData.qr_code_base64
    });

  } catch (error) {
    console.error('--- ERRO DETALHADO MERCADO PAGO ---');
    console.error(error?.cause || error?.message || error);
    console.error('------------------------------------');

    return res.status(500).json({ 
      message: 'Erro ao gerar Pix automático com o gateway.',
      details: error?.message || 'Verifique o terminal'
    });
  }
}