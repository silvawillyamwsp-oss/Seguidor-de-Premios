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
        totalTickets: 0,
        totalRevenue: 0,
        participants: []
      });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(fileData || '[]');

    const totalTickets = orders.reduce((acc, curr) => acc + Number(curr.tickets_count || 0), 0);
    const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);

    return res.status(200).json({
      totalTickets,
      totalRevenue,
      participants: orders
    });
  } catch (error) {
    console.error('Erro ao ler dados do dashboard:', error);
    return res.status(500).json({ 
      totalTickets: 0, 
      totalRevenue: 0, 
      participants: [] 
    });
  }
}