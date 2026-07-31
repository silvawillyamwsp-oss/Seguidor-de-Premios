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

  // Sanitiza o número para busca
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

    // Filtra agrupando TODAS as compras do telefone pesquisado (compara últimos 8 dígitos para compatibilidade)
    const userOrders = orders.filter(order => {
      const orderPhone = String(order.phone || '').replace(/\D/g, '');
      const isPhoneMatch = orderPhone === cleanPhone || orderPhone.slice(-8) === cleanPhone.slice(-8);
      
      // Exibe pedidos pagos ou pedidos sem campo status
      const isPaid = !order.status || order.status === 'approved' || order.status === 'paid' || order.status === 'concluido';

      return isPhoneMatch && isPaid;
    });

    // Agrupa e remove duplicatas de números do cliente
    const allNumbers = [...new Set(userOrders.flatMap(order => order.numbers || order.allocatedNumbers || []))];

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