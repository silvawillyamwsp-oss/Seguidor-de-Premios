import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const phoneParam = req.method === 'GET' ? req.query.phone : req.body?.phone;
  // Extrai apenas números
  const cleanPhone = String(phoneParam || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length < 8) {
    return res.status(400).json({ success: false, message: 'Digite um telefone válido com DDD.' });
  }

  // Pega os últimos 8 e 9 dígitos para garantir o match (independente de ter DDD ou 55 na frente)
  const last8 = cleanPhone.slice(-8);
  const last9 = cleanPhone.slice(-9);

  try {
    if (!prisma || !prisma.order) {
      return res.status(200).json({ success: true, orders: [] });
    }

    // Busca todas as ordens no banco
    const allOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filtra no JavaScript garantindo suporte a qualquer formato salvo
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