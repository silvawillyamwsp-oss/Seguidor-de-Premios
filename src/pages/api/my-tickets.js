import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Aceita o telefone via query string (GET) ou no body (POST)
  const phoneInput = req.method === 'GET' ? req.query.phone : req.body.phone;

  if (!phoneInput) {
    return res.status(400).json({ success: false, message: 'Telefone é obrigatório.' });
  }

  // Sanitiza o telefone de entrada (remove parênteses, traços, espaços, etc.)
  const cleanPhone = String(phoneInput).replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Informe um telefone/WhatsApp válido com DDD.' });
  }

  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(200).json({ success: true, tickets: [], orders: [] });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(fileData || '[]');

    // Filtra todas as compras pertencentes ao telefone digitado
    // (Compara o número limpo e também verifica pelos últimos 8 ou 9 dígitos para pegar compras antigas)
    const userOrders = orders.filter(order => {
      const orderPhone = String(order.phone || '').replace(/\D/g, '');
      if (!orderPhone) return false;

      const mainDigitsSearch = cleanPhone.slice(-8);
      const mainDigitsOrder = orderPhone.slice(-8);

      return orderPhone === cleanPhone || mainDigitsOrder === mainDigitsSearch;
    });

    // Agrupa todos os números/cotas do usuário
    const allNumbers = userOrders.flatMap(order => order.numbers || order.allocatedNumbers || []);

    return res.status(200).json({
      success: true,
      tickets: allNumbers,
      orders: userOrders
    });

  } catch (error) {
    console.error('Erro ao buscar números do cliente:', error);
    return res.status(500).json({ success: false, message: 'Erro ao consultar cotas.' });
  }
}