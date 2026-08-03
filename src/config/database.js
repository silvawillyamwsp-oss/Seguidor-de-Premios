// Configuração básica de conexão com o banco de dados
export const dbConfig = {
  url: process.env.DATABASE_URL || "",
  status: "Conectado"
};