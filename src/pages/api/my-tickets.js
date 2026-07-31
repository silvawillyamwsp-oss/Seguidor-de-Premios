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
    return res.status(400).json({ message: 'Telefone é obrigatório.' });
  }

  // Remove caracteres não numéricos para comparar apenas os dígitos
  const cleanPhone = String(phoneInput).replace(/\D/g, '');

  if (!cleanPhone) {
    return res.status(400).json({ message: 'Telefone inválido.' });
  }

  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(200).json({ success: true, tickets: [], orders: [] });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(fileData || '[]');

    // Filtra todas as compras pertencentes ao telefone digitado
    const userOrders = orders.filter(order => {
      const orderPhone = String(order.phone || '').replace(/\D/g, '');
      return orderPhone === cleanPhone;
    });

    // Agrupa todos os números/cotas do usuário
    const allNumbers = userOrders.flatMap(order => order.numbers || []);

    return res.status(200).json({
      success: true,
      tickets: allNumbers,
      orders: userOrders
    });

  } catch (error) {
    console.error('Erro ao buscar números do cliente:', error);
    return res.status(500).json({ message: 'Erro ao consultar cotas.' });
  }
}