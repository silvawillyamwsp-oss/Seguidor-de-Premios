import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

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
    if (!fs.existsSync(dataFilePath)) {
      return res.status(200).json({ success: true, tickets: [], orders: [] });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(fileData || '[]');

    const userOrders = orders.filter(order => {
      const orderPhone = String(order.phone || '').replace(/\D/g, '');
      if (!orderPhone) return false;

      // Compara número completo ou últimos 8 dígitos
      return orderPhone === cleanPhone || orderPhone.slice(-8) === cleanPhone.slice(-8);
    });

    // Agrupa todos os números com segurança contra nulos
    const allNumbers = userOrders.flatMap(order => {
      if (Array.isArray(order.numbers)) return order.numbers;
      if (Array.isArray(order.allocatedNumbers)) return order.allocatedNumbers;
      return [];
    });

    // Remove duplicatas de cotas
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