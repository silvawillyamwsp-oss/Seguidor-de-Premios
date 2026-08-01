import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de pagamento não informado' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-262874679746832-073107-da4bdec70c57cb8f045cdb4dc6974eaf-1094025176';

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const mpData = await mpRes.json();
    const currentStatus = mpData.status || 'pending';

    // Atualiza o registro no banco de dados
    if (currentStatus === 'approved') {
      await prisma.order.updateMany({
        where: { id: String(id) },
        data: { status: 'approved' }
      });
    }

    return res.status(200).json({ status: currentStatus });

  } catch (err) {
    console.error('Erro na verificação de pagamento:', err);
    return res.status(500).json({ error: 'Erro ao consultar status' });
  }
}