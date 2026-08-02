import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  try {
    let pedidos = [];

    // Tenta buscar no modelo Participant ou Order
    if (prisma.participant) {
      pedidos = await prisma.participant.findMany();
    } else if (prisma.order) {
      pedidos = await prisma.order.findMany();
    } else if (prisma.pedidos) {
      pedidos = await prisma.pedidos.findMany();
    }

    return res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos para sorteio:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}