import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const phoneParam = req.method === 'GET' ? req.query.phone : req.body?.phone;
  const cleanPhone = String(phoneParam || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length < 8) {
    return res.status(400).json({ success: false, message: 'Digite um telefone válido com DDD.' });
  }

  const last8 = cleanPhone.slice(-8);
  const last9 = cleanPhone.slice(-9);

  try {
    if (!prisma || !prisma.order) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const allOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const userOrders = allOrders.filter(order => {
      const dbPhoneClean = String(order.phone || '').replace(/\D/g, '');
      return (
        dbPhoneClean.endsWith(last8) ||
        dbPhoneClean.endsWith(last9) ||
        dbPhoneClean.includes(cleanPhone) ||
        cleanPhone.includes(dbPhoneClean)
      );
    });

    return res.status(200).json({
      success: true,
      orders: userOrders
    });

  } catch (error) {
    console.error('Erro ao consultar cotas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar cotas no servidor.'
    });
  }
}