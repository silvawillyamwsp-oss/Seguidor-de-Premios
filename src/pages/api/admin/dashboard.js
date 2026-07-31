import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(200).json({
        totalCotas: 0,
        totalArrecadado: 0,
        totalCompradores: 0,
        compradores: []
      });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(fileData || '[]');

    // Filtra apenas compras pagas ou registros válidos antigos
    const paidOrders = orders.filter(o => !o.status || o.status === 'paid' || o.status === 'approved' || o.status === 'concluido');

    // Mapeia e agrupa por comprador/telefone
    const buyersMap = {};
    let totalCotas = 0;
    let totalArrecadado = 0;

    paidOrders.forEach(order => {
      const phone = String(order.phone || '').replace(/\D/g, '');
      const numTickets = (order.numbers || []).length || order.tickets_count || 0;
      const price = parseFloat(order.total_price) || 0;

      totalCotas += numTickets;
      totalArrecadado += price;

      if (!buyersMap[phone]) {
        buyersMap[phone] = {
          name: order.name || 'Cliente',
          phone: phone,
          tickets: [...(order.numbers || [])],
          totalSpent: price
        };
      } else {
        buyersMap[phone].tickets.push(...(order.numbers || []));
        buyersMap[phone].totalSpent += price;
      }
    });

    const compradoresList = Object.values(buyersMap);

    return res.status(200).json({
      totalCotas,
      totalArrecadado,
      totalCompradores: compradoresList.length,
      compradores: compradoresList
    });

  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    return res.status(500).json({ message: 'Erro ao carregar o dashboard.' });
  }
}