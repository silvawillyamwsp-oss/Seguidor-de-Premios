import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { search } = req.query;

      // Filtro dinâmico por Nome, Telefone ou Número de Cota
      let whereClause = {};
      if (search && search.trim() !== '') {
        const queryStr = search.trim();
        whereClause = {
          OR: [
            { name: { contains: queryStr } },
            { phone: { contains: queryStr } },
            { tickets: { some: { number: { contains: queryStr } } } },
          ],
        };
      }

      const participants = await prisma.participant.findMany({
        where: whereClause,
        include: {
          tickets: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Cálculo das Métricas Gerais
      const allTickets = await prisma.ticket.findMany();
      const paidTickets = allTickets.filter(t => t.status === 'PAID');
      const pendingTickets = allTickets.filter(t => t.status === 'PENDING');
      
      const pricePerCota = 0.06;
      const totalRevenue = paidTickets.length * pricePerCota;

      return res.status(200).json({
        success: true,
        metrics: {
          totalParticipants: participants.length,
          totalTicketsSold: paidTickets.length,
          totalTicketsPending: pendingTickets.length,
          totalRevenue: totalRevenue.toFixed(2),
        },
        participants,
      });
    } catch (error) {
      console.error("Erro na API Admin:", error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar participantes.' });
    }
  }

  // Rota para Aprovação Manual de Pagamento (PUT)
  if (req.method === 'PUT') {
    try {
      const { participantId } = req.body;

      if (!participantId) {
        return res.status(400).json({ success: false, message: 'ID do participante é obrigatório.' });
      }

      // Atualiza o status de todas as cotas desse participante para "PAID"
      await prisma.ticket.updateMany({
        where: { participantId },
        data: { status: 'PAID' },
      });

      return res.status(200).json({ success: true, message: 'Pagamento aprovado com sucesso!' });
    } catch (error) {
      console.error("Erro ao aprovar pagamento:", error);
      return res.status(500).json({ success: false, message: 'Erro ao aprovar pagamento.' });
    }
  }

  return res.status(405).json({ message: 'Método não permitido.' });
}