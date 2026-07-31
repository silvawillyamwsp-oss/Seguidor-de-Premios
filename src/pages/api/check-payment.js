import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-262874679746832-073107-da4bdec70c57cb8f045cdb4dc6974eaf-1094025176' 
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID de pagamento ausente' });
  }

  try {
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id });

    // Se o pagamento foi aprovado, atualiza o status na lista do Admin
    if (paymentInfo.status === 'approved' && global.ordersList) {
      const order = global.ordersList.find(o => String(o.id) === String(id));
      if (order) {
        order.status = 'approved';
      }
    }

    return res.status(200).json({
      status: paymentInfo.status
    });
  } catch (error) {
    console.error('Erro na checagem de pagamento:', error);
    return res.status(500).json({ message: 'Erro ao checar pagamento' });
  }
}