import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // 1. Busca todos os pedidos cadastrados no banco
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Filtra pedidos aprovados/pagos
    const approvedOrders = orders.filter((order) => {
      const st = (order.status || '').toLowerCase();
      return st === 'approved' || st === 'paid' || st === 'pago';
    });

    // 3. Calcula total de cotas aprovadas
    const totalTickets = approvedOrders.reduce((acc, order) => {
      const count = order.ticketsCount || (Array.isArray(order.numbers) ? order.numbers.length : 0);
      return acc + count;
    }, 0);

    // 4. Calcula valor total arrecadado
    const totalRevenue = approvedOrders.reduce((acc, order) => {
      return acc + (Number(order.totalPrice) || 0);
    }, 0);

    // 5. Retorna os dados exatos para o painel admin
    return res.status(200).json({
      success: true,
      totalTickets,
      totalRevenue,
      participants: orders,
    });
  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro interno no servidor' 
    });
  }
}