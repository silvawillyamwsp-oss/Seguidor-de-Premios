import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalCotas: 0,
    totalArrecadado: 0,
    totalCompradores: 0,
    compradores: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        if (resData) {
          setData({
            totalCotas: resData.totalCotas || 0,
            totalArrecadado: resData.totalArrecadado || 0,
            totalCompradores: resData.totalCompradores || 0,
            compradores: Array.isArray(resData.compradores) ? resData.compradores : [],
            orders: Array.isArray(resData.orders) ? resData.orders : []
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do admin:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', padding: 20 }}>Carregando painel admin...</div>;
  }

  if (error) {
    return <div style={{ color: '#fff', padding: 20 }}>Erro ao carregar os dados. Tente recarregar a página.</div>;
  }

  return (
    <div style={{ padding: 20, color: '#fff', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h1>Painel Administrativo</h1>
      <hr />
      <div style={{ display: 'flex', gap: 20, margin: '20px 0' }}>
        <div>
          <h3>Total de Cotas</h3>
          <p>{data.totalCotas}</p>
        </div>
        <div>
          <h3>Total Arrecadado</h3>
          <p>R$ {Number(data.totalArrecadado).toFixed(2)}</p>
        </div>
        <div>
          <h3>Compradores</h3>
          <p>{data.totalCompradores}</p>
        </div>
      </div>

      <h2>Lista de Pedidos</h2>
      {data.orders.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <ul>
          {data.orders.map((order, index) => (
            <li key={order.id || index} style={{ marginBottom: 10 }}>
              <strong>{order.name || 'Cliente'}</strong> - {order.phone} | Cotas: {(order.numbers || []).join(', ')} | Status: {order.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}