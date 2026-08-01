import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const paymentId = req.body?.data?.id || req.query?.id || req.query?.['data.id'];

    if (!paymentId) {
      return res.status(200).json({ message: 'Notificação sem ID' });
    }

    // Consulta o status real no Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (response.ok) {
      const paymentData = await response.json();

      if (paymentData.status === 'approved') {
        // Atualiza a cota/pedido no Supabase via Prisma
        await prisma.order.updateMany({
          where: { paymentId: String(paymentId) },
          data: { status: 'paid' },
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no Webhook:', error);
    return res.status(200).json({ error: error.message });
  }
}