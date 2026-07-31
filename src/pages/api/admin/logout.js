import { serialize } from 'cookie';

export default function handler(req, res) {
  const cookie = serialize('admin_token', '', {
    httpOnly: true,
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ success: true });
}