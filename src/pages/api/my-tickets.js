import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const phoneParam = req.method === 'GET' ? req.query.phone : req.body?.phone;
  const cleanPhone = String(phoneParam || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Digite um telefone válido com DDD.' });
  }

  try {
    if (!prisma || !prisma.order) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        phone: {
          contains: cleanPhone
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      orders: orders || []
    });

  } catch (error) {
    console.error('Erro ao buscar números:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar cotas. Tente novamente em instantes.'
    });
  }
}