import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // 1. Busca todos os pedidos do banco de dados ordenados pelos mais recentes
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Filtra pedidos aprovados/pagos para calcular os totais
    const approvedOrders = orders.filter(
      (order) => order.status === 'approved' || order.status === 'APPROVED' || order.status === 'PAID'
    );

    // 3. Soma o total de cotas aprovadas
    const totalTickets = approvedOrders.reduce((acc, order) => {
      const count = order.ticketsCount || (Array.isArray(order.numbers) ? order.numbers.length : 0);
      return acc + count;
    }, 0);

    // 4. Soma a arrecadação total das vendas aprovadas
    const totalRevenue = approvedOrders.reduce((acc, order) => {
      return acc + (Number(order.totalPrice) || 0);
    }, 0);

    // 5. Retorna no formato exato que o dashboard.jsx precisa
    return res.status(200).json({
      success: true,
      totalTickets,
      totalRevenue,
      participants: orders, // Envia a lista completa de pedidos para a tabela
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos no admin:', error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
}