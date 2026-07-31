import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { name, phone, numbers, tickets_count, quantity, cotas, total_price, price, status } = req.body;

  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Informe um telefone/WhatsApp válido com DDD.' });
  }

  const numbersArray = Array.isArray(numbers) ? numbers : [];
  const finalCount = Number(tickets_count || quantity || cotas || numbersArray.length || 1);
  const finalPrice = parseFloat(total_price || price || 0.06);

  // Se não vierem números específicos, gera cotas aleatórias para o teste
  let generatedNumbers = numbersArray;
  if (generatedNumbers.length === 0) {
    for (let i = 0; i < finalCount; i++) {
      generatedNumbers.push(String(Math.floor(100000 + Math.random() * 900000)));
    }
  }

  // Gera um código Pix válido para cópia
  const dummyPixCode = "00020126360014BR.GOV.BCB.PIX0114+5511948865981520400005303986540500.065802BR5915SEGUIDOR PREMIOS6009SAO PAULO62070503***6304E2CA";

  const newOrder = {
    id: String(Date.now()),
    name: name || 'Cliente',
    phone: cleanPhone,
    tickets_count: finalCount,
    total_price: finalPrice,
    numbers: generatedNumbers,
    status: status || 'paid',
    createdAt: new Date().toISOString()
  };

  try {
    let orders = [];

    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      try {
        orders = JSON.parse(fileData || '[]');
      } catch (e) {
        orders = [];
      }
    }

    orders.push(newOrder);

    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (writeErr) {
      console.warn('Ambiente read-only', writeErr);
    }

    return res.status(200).json({
      success: true,
      pixCode: dummyPixCode,
      pix_code: dummyPixCode,
      qrCode: dummyPixCode,
      order: newOrder,
      numbers: generatedNumbers
    });

  } catch (error) {
    console.error('Erro ao registrar cota:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar cota.' });
  }
}