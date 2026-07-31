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
    return res.status(400).json({ success: false, message: 'Informe um telefone/WhatsApp válido com DDD.' });
  }

  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(200).json({ success: true, tickets: [], orders: [] });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(fileData || '[]');

    // Filtra compras por telefone E considera pago se status for 'paid'/'approved' OU se não houver campo status
    const userOrders = orders.filter(order => {
      const orderPhone = String(order.phone || '').replace(/\D/g, '');
      const isPhoneMatch = orderPhone === cleanPhone || orderPhone.slice(-8) === cleanPhone.slice(-8);

      // Se não tiver a propriedade 'status', assume como pago/válido para não ocultar compras existentes
      const isPaid = !order.status || order.status === 'approved' || order.status === 'paid' || order.status === 'concluido';

      return isPhoneMatch && isPaid;
    });

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