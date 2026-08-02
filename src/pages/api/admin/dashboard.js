import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // 1. Busca todos os pedidos no banco de dados
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 2. Filtra apenas os pedidos pagos/aprovados
    const approvedOrders = orders.filter(
      (order) => order.status === 'approved' || order.status === 'APPROVED' || order.status === 'PAID'
    );

    // 3. Calcula o total de cotas vendidas
    const totalCotas = approvedOrders.reduce((acc, order) => {
      const count = Array.isArray(order.numbers) ? order.numbers.length : (order.ticketsCount || 0);
      return acc + count;
    }, 0);

    // 4. Calcula o valor total arrecadado
    const totalArrecadado = approvedOrders.reduce((acc, order) => {
      return acc + (Number(order.totalPrice) || 0);
    }, 0);

    // 5. Calcula o número de compradores únicos (por telefone)
    const uniquePhones = new Set(approvedOrders.map((order) => order.phone).filter(Boolean));
    const totalCompradores = uniquePhones.size;

    // 6. Retorna tudo pronto para a tela do Painel Admin
    return res.status(200).json({
      totalCotas,
      totalArrecadado,
      totalCompradores,
      orders
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return res.status(500).json({ error: 'Erro ao processar dados no servidor' });
  }
}