import { useSelector } from 'react-redux';
import { selectOffers } from '../searchSlice';
import RequestStatus from './RequestStatus';

const formatPrice = (price) => (price === null ? 'нет в наличии' : `${price.toLocaleString('ru-RU')} ₽`);

// Этап 2: таблица аналогов и предложений
export default function OffersTable() {
  const offers = useSelector(selectOffers);

  return (
    <RequestStatus request={offers} emptyText="Предложений не найдено">
      <h2 className="h5">Аналоги и предложения</h2>
      <div className="table-responsive">
        <table className="table table-sm table-hover">
          <thead>
            <tr>
              <th>Производитель</th>
              <th>Номер</th>
              <th>Название</th>
              <th>Склад</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {offers.items.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.brand}</td>
                <td>{offer.number}</td>
                <td>{offer.name}</td>
                <td>{offer.warehouse || '-'}</td>
                <td className="text-end text-nowrap">{formatPrice(offer.price)}</td>
                <td className="text-end">{offer.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequestStatus>
  );
}
