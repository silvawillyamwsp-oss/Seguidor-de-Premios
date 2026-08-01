import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { phone } = req.query;
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length < 8) {
    return res.status(400).json({ success: false, message: 'Informe um telefone válido.' });
  }

  try {
    // Busca todas as ordens vinculadas ao número pesquisado
    const userOrders = await prisma.order.findMany({
      where: {
        phone: {
          contains: cleanPhone
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Extrai e junta todas as cotas encontradas
    const allTickets = userOrders.reduce((acc, order) => {
      return [...acc, ...(order.numbers || [])];
    }, []);

    return res.status(200).json({
      success: true,
      tickets: allTickets,
      orders: userOrders
    });

  } catch (error) {
    console.error('Erro ao buscar cotas:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao consultar cotas.' });
  }
}