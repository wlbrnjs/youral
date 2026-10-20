import Loader from './Loader';

// Показывает лоадер, ошибку или "ничего не найдено". Когда данные есть - показывает children.
export default function RequestStatus({ request, emptyText, children }) {
  if (request.status === 'idle') return null;
  if (request.status === 'loading') return <Loader />;
  if (request.status === 'failed') return <div className="alert alert-danger">{request.error}</div>;
  if (request.items.length === 0) return <div className="alert alert-secondary">{emptyText}</div>;
  return children;
}
