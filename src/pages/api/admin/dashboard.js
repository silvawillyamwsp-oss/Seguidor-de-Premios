import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // 1. Busca todos os pedidos do banco de dados (mais recentes primeiro)
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Filtra pedidos com pagamento confirmado/aprovado
    const approvedOrders = orders.filter((order) => {
      const st = (order.status || '').toLowerCase();
      return st === 'approved' || st === 'paid' || st === 'pago';
    });

    // 3. Soma total de cotas aprovadas
    const totalTickets = approvedOrders.reduce((acc, order) => {
      const count = order.ticketsCount || (Array.isArray(order.numbers) ? order.numbers.length : 0);
      return acc + count;
    }, 0);

    // 4. Soma arrecadação total das vendas aprovadas
    const totalRevenue = approvedOrders.reduce((acc, order) => {
      return acc + (Number(order.totalPrice) || 0);
    }, 0);

    // 5. Retorna o JSON exato que a tela precisa
    return res.status(200).json({
      success: true,
      totalTickets,
      totalRevenue,
      participants: orders, // Envia todos os pedidos para a tabela
    });
  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
}