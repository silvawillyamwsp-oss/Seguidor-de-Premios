import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, numbers, tickets_count, total_price, status } = req.body;

  // Validação básica dos dados recebidos
  if (!phone || (!numbers && !tickets_count)) {
    return res.status(400).json({ success: false, message: 'Dados de compra incompletos.' });
  }

  // Limpa a formatação do telefone deixando apenas os dígitos
  const cleanPhone = String(phone).replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Telefone inválido.' });
  }

  // Garante que 'numbers' seja sempre um array válido
  const numbersArray = Array.isArray(numbers) ? numbers : [];

  const newOrder = {
    id: String(Date.now()),
    name: name || 'Cliente',
    phone: cleanPhone,
    tickets_count: tickets_count || numbersArray.length,
    total_price: parseFloat(total_price) || 0,
    numbers: numbersArray,
    status: status || 'paid', // Registra o pedido como pago por padrão
    createdAt: new Date().toISOString()
  };

  try {
    let orders = [];

    // Lê os dados do arquivo orders.json se existir
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      try {
        orders = JSON.parse(fileData || '[]');
      } catch (e) {
        orders = [];
      }
    }

    // Adiciona o novo pedido ao array
    orders.push(newOrder);

    // Tenta salvar localmente (funciona em desenvolvimento no VS Code)
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (writeErr) {
      console.warn('Aviso: Ambiente serverless/read-only. A gravação no arquivo estático não persiste em produção sem banco de dados.', writeErr);
    }

    return res.status(200).json({
      success: true,
      order: newOrder
    });

  } catch (error) {
    console.error('Erro ao registrar cota:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar cota.' });
  }
}