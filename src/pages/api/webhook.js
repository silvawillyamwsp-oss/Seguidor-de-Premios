import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // O Mercado Pago envia o ID do pagamento via body (data.id) ou via query String (?id=... ou ?data.id=...)
    const paymentId = req.body?.data?.id || req.query?.id || req.query?.['data.id'];

    if (!paymentId) {
      // Retorna 200 pro Mercado Pago não ficar tentando reenviar notificações de teste vazias
      return res.status(200).json({ message: 'Notificação recebida sem ID de pagamento' });
    }

    // 1. Consulta o status real do pagamento direto na API do Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('Erro ao consultar pagamento no Mercado Pago:', await response.text());
      return res.status(200).json({ message: 'Erro ao consultar Mercado Pago' });
    }

    const paymentData = await response.json();

    // 2. Se o status for aprovado, atualiza o pedido no banco de dados
    if (paymentData.status === 'approved') {
      // Atualize conforme os nomes dos campos no seu Prisma (ex: externalId, paymentId ou id)
      await prisma.order.updateMany({
        where: {
          // Busca pelo ID do pagamento do Mercado Pago ou pelo ID do pedido guardado
          paymentId: String(paymentId),
        },
        data: {
          status: 'paid', // ou 'approved' dependendo do seu schema
        },
      });

      console.log(`✅ Pagamento ${paymentId} aprovado e atualizado no banco!`);
    }

    // Responde 200 com sucesso pro Mercado Pago
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Erro no processamento do Webhook:', error);
    // Responder 200 mesmo em caso de erro evita que o Mercado Pago bloqueie suas requisições com 500
    return res.status(200).json({ error: error.message });
  }
}