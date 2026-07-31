import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

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

    const buyersMap = {};
    let totalCotas = 0;
    let totalArrecadado = 0;

    orders.forEach(order => {
      // Normalização e prevenção de erros por campos inexistentes
      const phone = String(order.phone || '').replace(/\D/g, '');
      if (!phone) return;

      const orderNumbers = Array.isArray(order.numbers) 
        ? order.numbers 
        : (Array.isArray(order.allocatedNumbers) ? order.allocatedNumbers : []);
      
      const numTickets = orderNumbers.length || Number(order.tickets_count) || 0;
      const price = parseFloat(order.total_price) || 0;

      totalCotas += numTickets;
      totalArrecadado += price;

      if (!buyersMap[phone]) {
        buyersMap[phone] = {
          name: order.name || 'Cliente',
          phone: phone,
          tickets: [...orderNumbers],
          totalSpent: price
        };
      } else {
        buyersMap[phone].tickets.push(...orderNumbers);
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
    console.error('Erro ao carregar dados do admin:', error);
    return res.status(500).json({ message: 'Erro ao processar dados do painel.' });
  }
}