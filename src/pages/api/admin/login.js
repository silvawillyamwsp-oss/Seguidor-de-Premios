export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { username, password } = req.body;

  // Define usuário e senha padrão ou pega do arquivo .env.local
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

  // Valida tanto o usuário quanto a senha
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    // Define o cookie de sessão autenticada
    res.setHeader(
      'Set-Cookie',
      'admin_token=authenticated; Path=/; HttpOnly; SameSite=Strict'
    );
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ message: 'Usuário ou senha incorretos' });
}