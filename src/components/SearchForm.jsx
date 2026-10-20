import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBrands } from '../searchSlice';

// Этап 1: ввод артикула
export default function SearchForm() {
  const [number, setNumber] = useState('');
  const dispatch = useDispatch();

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(fetchBrands(number.trim()));
  }

  return (
    <form className="d-flex gap-2 mb-4" onSubmit={handleSubmit}>
      <input
        className="form-control"
        placeholder="Артикул, например 0189"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
      />
      <button className="btn btn-primary" disabled={!number.trim()}>
        Найти
      </button>
    </form>
  );
}
