import { query } from '../../../config/database';

// Função para calcular o Checksum CRC16 padrão do PIX (BR Code)
function getCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Gerador dinâmico do código PIX Copia e Cola COM O VALOR EMBUTIDO
function generateDynamicPixPayload({ pixKey, name, city, txid, amount }) {
  const amountStr = Number(amount).toFixed(2);
  
  let payload = "000201"; // Payload Format Indicator
  
  // Informações da Conta/Chave PIX
  const merchantAccount = "0014br.gov.bcb.pix01" + String(pixKey.length).padStart(2, '0') + pixKey;
  payload += "26" + String(merchantAccount.length).padStart(2, '0') + merchantAccount;
  
  payload += "52040000"; // Merchant Category Code
  payload += "5303986";  // Moeda: BRL (986)
  
  // Tag 54: Insere o valor dinâmico da compra (ex: 1.90, 9.50)
  payload += "54" + String(amountStr.length).padStart(2, '0') + amountStr;
  
  payload += "5802BR";   // País (BR)
  
  // Nome do Favorecido (máx 25 caracteres)
  const nameClean = name.substring(0, 25);
  payload += "59" + String(nameClean.length).padStart(2, '0') + nameClean;
  
  // Cidade do Favorecido (máx 15 caracteres)
  const cityClean = city.substring(0, 15);
  payload += "60" + String(cityClean.length).padStart(2, '0') + cityClean;
  
  // Identificador da Transação (TxID)
  const txidClean = (txid || "***").replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || "***";
  const addData = "05" + String(txidClean.length).padStart(2, '0') + txidClean;
  payload += "62" + String(addData.length).padStart(2, '0') + addData;
  
  payload += "6304"; // Marcador do CRC16
  
  const crc = getCRC16(payload);
  return payload + crc;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { qty, phone, name } = req.body;

    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Quantidade inválida de cotas.' });
    }

    const unitPrice = 0.19; // Preço de R$ 0,19 por cota
    const totalAmount = (qty * unitPrice).toFixed(2);
    const transactionId = `TX${Date.now()}`.substring(0, 20);

    // Seus dados oficiais da chave PIX
    const pixKey = "ec248911-3b16-4fe6-a8cb-9b88156326d2";
    const recipientName = "Willyam Da Silva Pereira";
    const cityName = "Sao Paulo";

    // Gera a chave PIX Copia e Cola JÁ COM O VALOR CALCULADO
    const pixCopyPaste = generateDynamicPixPayload({
      pixKey,
      name: recipientName,
      city: cityName,
      txid: transactionId,
      amount: totalAmount
    });

    // Gera a imagem do QR Code dinâmica contendo o valor
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`;

    try {
      await query(
        'INSERT INTO orders (transaction_id, customer_name, customer_phone, qty, amount, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [transactionId, name || 'Cliente', phone || '', qty, totalAmount, 'PENDING']
      );
    } catch (dbErr) {
      console.warn('Alerta: Executando sem banco de dados em ambiente local.');
    }

    return res.status(200).json({
      success: true,
      transactionId,
      qty,
      totalAmount,
      pixCopyPaste,
      qrCodeUrl,
      recipient: recipientName,
      city: cityName
    });
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return res.status(500).json({ message: 'Erro ao processar cobrança PIX.' });
  }
}