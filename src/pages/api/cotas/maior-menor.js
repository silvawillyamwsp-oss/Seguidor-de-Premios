import { createClient } from '@supabase/supabase-js';

// Inicializa a conexão com o Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // 1. Busca todas as compras com status "pago" ou "approved"
    const { data: pedidos, error } = await supabase
      .from('Order') // Substitua pelo nome da sua tabela se for diferente (ex: 'compras')
      .select('name, phone, numbers, created_at, status')
      .or('status.eq.pago,status.eq.approved');

    if (error) throw error;

    if (!pedidos || pedidos.length === 0) {
      return res.status(200).json({ menorCota: null, maiorCota: null });
    }

    let menorCotaObj = null;
    let maiorCotaObj = null;
    let menorNumero = Infinity;
    let maiorNumero = -Infinity;

    // 2. Percorre todos os pedidos e descobre o menor e o maior número
    pedidos.forEach((ped) => {
      // Garante que o campo de números seja um array
      let cotasArray = [];
      if (Array.isArray(ped.numeros)) {
        cotasArray = ped.numeros;
      } else if (typeof ped.numeros === 'string') {
        cotasArray = ped.numeros.split(',').map((n) => n.trim());
      }

      cotasArray.forEach((cota) => {
        const num = parseInt(cota, 10);
        if (!isNaN(num)) {
          // Checa Menor Cota
          if (num < menorNumero) {
            menorNumero = num;
            menorCotaObj = {
              nome: ped.nome || 'Comprador',
              numero: String(num).padStart(6, '0'),
              telefone: mascararTelefone(ped.telefone),
              dataHora: formatarData(ped.created_at),
            };
          }

          // Checa Maior Cota
          if (num > maiorNumero) {
            maiorNumero = num;
            maiorCotaObj = {
              nome: ped.nome || 'Comprador',
              numero: String(num).padStart(6, '0'),
              telefone: mascararTelefone(ped.telefone),
              dataHora: formatarData(ped.created_at),
            };
          }
        }
      });
    });

    return res.status(200).json({
      menorCota: menorCotaObj,
      maiorCota: maiorCotaObj,
    });
  } catch (err) {
    console.error('Erro Supabase:', err);
    return res.status(500).json({ message: 'Erro ao buscar dados no Supabase' });
  }
}

// Função para mascarar o telefone igual na foto (ex: (11) *********)
function mascararTelefone(tel) {
  if (!tel) return '(00) *********';
  const limpo = tel.replace(/\D/g, '');
  const ddd = limpo.substring(0, 2);
  return `(${ddd}) *********`;
}

// Função para formatar a data/hora
function formatarData(dataString) {
  if (!dataString) return '';
  const d = new Date(dataString);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}