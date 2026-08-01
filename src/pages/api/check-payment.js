import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de pagamento não informado' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-262874679746832-073107-da4bdec70c57cb8f045cdb4dc6974eaf-1094025176';

  try {
    // Consulta o status real no Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const mpData = await mpRes.json();
    const currentStatus = mpData.status || 'pending';

    // Atualiza a lista em memória/local caso o status seja aprovado
    if (fs.existsSync(dataFilePath)) {
      try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        let orders = JSON.parse(fileContent || '[]');
        
        let updated = false;
        orders = orders.map(order => {
          if (String(order.id) === String(id) || String(order.paymentId) === String(id)) {
            order.status = currentStatus;
            updated = true;
          }
          return order;
        });

        if (updated) {
          fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
        }
      } catch (err) {
        console.error('Erro ao atualizar pedidos no JSON:', err);
      }
    }

    return res.status(200).json({ status: currentStatus });

  } catch (err) {
    console.error('Erro na verificação de pagamento:', err);
    return res.status(500).json({ error: 'Erro ao consultar status' });
  }
}