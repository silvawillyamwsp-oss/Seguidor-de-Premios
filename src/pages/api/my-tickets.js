import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const phoneInput = req.method === 'GET' ? req.query.phone : req.body.phone;

  if (!phoneInput) {
    return res.status(400).json({ success: false, message: 'Telefone é obrigatório.' });
  }

  const cleanPhone = String(phoneInput).replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Informe um WhatsApp válido com DDD.' });
  }

  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

    if (!fs.existsSync(dataFilePath)) {
      return res.status(200).json({ success: true, tickets: [], orders: [] });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    let orders = [];
    
    try {
      orders = JSON.parse(fileData || '[]');
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      orders = [];
    }

    const userOrders = orders.filter(order => {
      const orderPhone = String(order.phone || '').replace(/\D/g, '');
      if (!orderPhone) return false;

      const isPhoneMatch = orderPhone === cleanPhone || orderPhone.slice(-8) === cleanPhone.slice(-8);
      const isPaid = !order.status || order.status === 'approved' || order.status === 'paid' || order.status === 'concluido';

      return isPhoneMatch && isPaid;
    });

    const allNumbers = userOrders.flatMap(order => {
      if (Array.isArray(order.numbers)) return order.numbers;
      if (Array.isArray(order.allocatedNumbers)) return order.allocatedNumbers;
      return [];
    });

    const uniqueNumbers = [...new Set(allNumbers)];

    return res.status(200).json({
      success: true,
      tickets: uniqueNumbers,
      orders: userOrders
    });

  } catch (error) {
    console.error('Erro na consulta de cotas:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar cotas.' });
  }
}