import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, numbers, tickets_count, total_price, status } = req.body;

  if (!phone || !numbers || numbers.length === 0) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  // Sanitiza o telefone salvando apenas números de forma padronizada
  const cleanPhone = String(phone).replace(/\D/g, '');

  const newOrder = {
    id: String(Date.now()),
    name: name || 'Cliente',
    phone: cleanPhone,
    tickets_count: tickets_count || numbers.length,
    total_price: total_price || 0,
    numbers: numbers,
    status: status || 'paid', // Garante que a compra nasça confirmada/paga
    createdAt: new Date().toISOString()
  };

  try {
    let orders = [];

    // Lê o arquivo existente se houver
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      try {
        orders = JSON.parse(fileData || '[]');
      } catch (e) {
        orders = [];
      }
    }

    // Adiciona o novo pedido à lista
    orders.push(newOrder);

    // Salva de volta no orders.json
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');

    return res.status(200).json({
      success: true,
      order: newOrder
    });

  } catch (error) {
    console.error('Erro ao salvar no orders.json:', error);
    return res.status(500).json({ success: false, message: 'Erro ao registrar cota.' });
  }
}