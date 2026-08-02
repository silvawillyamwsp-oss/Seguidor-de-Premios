import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    try {
      const { search } = req.query;

      if (!prisma || !prisma.order) {
        return res.status(200).json({
          success: true,
          metrics: { totalParticipants: 0, totalTicketsSold: 0, totalTicketsPending: 0, totalRevenue: '0.00' },
          participants: []
        });
      }

      // Busca todas as ordens de compra
      const allOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Filtro dinâmico (Nome, Telefone ou Número da Cota)
      let filteredOrders = allOrders;
      if (search && search.trim() !== '') {
        const queryStr = search.trim().toLowerCase();
        const cleanQuery = queryStr.replace(/\D/g, '');

        filteredOrders = allOrders.filter(order => {
          const nameMatch = (order.name || '').toLowerCase().includes(queryStr);
          const phoneMatch = cleanQuery ? String(order.phone || '').includes(cleanQuery) : false;
          const numberMatch = (order.numbers || []).some(num => String(num).includes(queryStr));
          return nameMatch || phoneMatch || numberMatch;
        });
      }

      // Mapeia ordens para o formato exigido pelo Painel Admin
      const participants = filteredOrders.map(order => {
        const isPaid = order.status === 'approved' || order.status === 'PAID';
        return {
          id: order.id,
          name: order.name,
          phone: order.phone,
          totalPrice: order.totalPrice,
          status: isPaid ? 'PAID' : 'PENDING',
          createdAt: order.createdAt,
          ticketsCount: order.ticketsCount || (order.numbers || []).length,
          tickets: (order.numbers || []).map(num => ({
            id: `${order.id}-${num}`,
            number: num,
            status: isPaid ? 'PAID' : 'PENDING'
          }))
        };
      });

      // Cálculo das Métricas
      const approvedOrders = allOrders.filter(o => o.status === 'approved' || o.status === 'PAID');
      const pendingOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'PENDING');

      const totalTicketsSold = approvedOrders.reduce((acc, o) => acc + Number(o.ticketsCount || (o.numbers || []).length), 0);
      const totalTicketsPending = pendingOrders.reduce((acc, o) => acc + Number(o.ticketsCount || (o.numbers || []).length), 0);
      const totalRevenue = approvedOrders.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0);

      return res.status(200).json({
        success: true,
        metrics: {
          totalParticipants: allOrders.length,
          totalTicketsSold,
          totalTicketsPending,
          totalRevenue: totalRevenue.toFixed(2),
        },
        participants,
        orders: filteredOrders
      });

    } catch (error) {
      console.error("Erro na API Admin:", error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar participantes.' });
    }
  }

  // Rota para Aprovação Manual no Admin (PUT)
  if (req.method === 'PUT') {
    try {
      const { participantId, orderId } = req.body;
      const targetId = String(participantId || orderId || '');

      if (!targetId) {
        return res.status(400).json({ success: false, message: 'ID é obrigatório.' });
      }

      await prisma.order.updateMany({
        where: { id: targetId },
        data: { status: 'approved' },
      });

      return res.status(200).json({ success: true, message: 'Pagamento aprovado com sucesso!' });
    } catch (error) {
      console.error("Erro ao aprovar pagamento:", error);
      return res.status(500).json({ success: false, message: 'Erro ao aprovar pagamento.' });
    }
  }

  return res.status(405).json({ message: 'Método não permitido.' });
}