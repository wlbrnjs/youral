import { useDispatch, useSelector } from 'react-redux'

import { fetchOffers, selectBrands, selectOffers } from '../searchSlice'
import RequestStatus from './RequestStatus'

// Этап 1: список производителей. Клик по производителю запускает этап 2.
export default function BrandList() {
  const brands = useSelector(selectBrands)
  const selected = useSelector(selectOffers).params
  const dispatch = useDispatch()

  return (
    <RequestStatus
      request={brands}
      emptyText="По этому артикулу ничего не найдено"
    >
      <h2 className="h5">Выберите производителя</h2>
      <div className="list-group mb-4">
        {brands.items.map(item => (
          <button
            key={item.goodsID}
            type="button"
            className={`list-group-item list-group-item-action ${item.goodsID === selected?.goodsID ? 'active' : ''}`}
            onClick={() => dispatch(fetchOffers(item))}
          >
            <strong>{item.brand}</strong> {item.number} - {item.name}
          </button>
        ))}
      </div>
    </RequestStatus>
  )
}
