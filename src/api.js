// Работа с API "Проценка" (документация: wsprice.pdf)
const API_URL = 'http://api.favorit-parts.ru/hs/hsprice/';
const API_KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001'; // демо-ключ из документации

// Один запрос к API. Возвращает массив товаров или бросает ошибку с понятным текстом.
async function request(params) {
  // URLSearchParams сам экранирует спецсимволы (например, "/" в "NGK/NTK")
  const url = `${API_URL}?${new URLSearchParams({ key: API_KEY, ...params })}`;

  let data;
  try {
    const response = await fetch(url);
    data = await response.json();
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.');
  }

  if (data.error) throw new Error(data.error);

  // Если ничего не найдено, API присылает одну "пустую" позицию без бренда - отбрасываем её
  return data.goods.filter((item) => item.brand);
}

// Этап 1: все производители, у которых есть деталь с таким номером
export function getBrands(number) {
  return request({ number });
}

// Этап 2: сама деталь и её аналоги, разложенные по складским предложениям
export async function getOffers({ number, brand }) {
  const goods = await request({ number, brand, analogues: 'on' });
  return goods.flatMap((item) => [item, ...(item.analogues ?? [])]).flatMap(toOffers);
}

// Цену и остаток берём со склада (так требует документация).
// Товар без складов - одна строка без цены и с нулевым остатком.
function toOffers(item) {
  const part = { brand: item.brand, number: item.number, name: item.name };

  if (item.warehouses.length === 0) {
    return [{ id: item.goodsID, ...part, warehouse: '', price: null, stock: 0 }];
  }

  return item.warehouses.map((warehouse) => ({
    id: `${item.goodsID}-${warehouse.id}`,
    ...part,
    warehouse: warehouse.code,
    price: warehouse.price,
    stock: warehouse.stock,
  }));
}
