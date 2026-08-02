import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ status: 'error', message: 'ID de pagamento ausente.' });
  }

  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!mpRes.ok) {
      return res.status(200).json({ status: 'pending' });
    }

    const mpData = await mpRes.json();
    const currentStatus = mpData.status; // 'approved', 'pending', etc.

    if (currentStatus === 'approved') {
      try {
        if (prisma && prisma.order) {
          await prisma.order.updateMany({
            where: { id: String(id) },
            data: { status: 'approved' }
          });
        }
      } catch (dbError) {
        console.warn('Alerta ao atualizar status no banco:', dbError.message);
      }
    }

    return res.status(200).json({ status: currentStatus });

  } catch (error) {
    console.error('Erro na checagem de pagamento:', error);
    return res.status(200).json({ status: 'pending' });
  }
}