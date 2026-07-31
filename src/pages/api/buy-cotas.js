import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, numbers, tickets_count, quantity, cotas, total_price, price, status } = req.body;

  // Validação flexível do telefone
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Informe um telefone/WhatsApp válido com DDD.' });
  }

  // Normalização da quantidade de cotas compradas
  const numbersArray = Array.isArray(numbers) ? numbers : [];
  const finalCount = Number(tickets_count || quantity || cotas || numbersArray.length || 1);
  const finalPrice = parseFloat(total_price || price || 0);

  const newOrder = {
    id: String(Date.now()),
    name: name || 'Cliente',
    phone: cleanPhone,
    tickets_count: finalCount,
    total_price: finalPrice,
    numbers: numbersArray,
    status: status || 'paid',
    createdAt: new Date().toISOString()
  };

  try {
    let orders = [];

    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      try {
        orders = JSON.parse(fileData || '[]');
      } catch (e) {
        orders = [];
      }
    }

    orders.push(newOrder);

    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (writeErr) {
      console.warn('Aviso: Ambiente serverless read-only.', writeErr);
    }

    return res.status(200).json({
      success: true,
      order: newOrder
    });

  } catch (error) {
    console.error('Erro ao registrar cota:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar cota.' });
  }
}