import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'

import { getBrands, getOffers } from './api'

// Подменяем fetch: он "вернёт" переданный JSON
function mockFetch(json) {
  return spyOn(globalThis, 'fetch').mockResolvedValue({ json: () => Promise.resolve(json) })
}

// Параметры URL, с которым был вызван fetch
const requestParams = fetch => new URL(fetch.mock.calls[0][0]).searchParams

const item = fields => ({
  goodsID: 'A',
  brand: 'ZEN',
  number: '0189',
  name: 'Бендикс',
  warehouses: [],
  ...fields,
})

afterEach(() => mock.restore())

describe('getBrands', () => {
  it('ищет по номеру и возвращает найденные позиции', async () => {
    const fetch = mockFetch({ goods: [item()] })

    expect(await getBrands('0189')).toEqual([item()])
    expect(requestParams(fetch).get('number')).toBe('0189')
    expect(requestParams(fetch).get('key')).toBeTruthy()
  })

  it('отбрасывает пустую заглушку, которую API шлёт, если ничего не найдено', async () => {
    mockFetch({ goods: [item({ brand: '', number: '', name: '' })] })

    expect(await getBrands('nope')).toEqual([])
  })

  it('пробрасывает текст ошибки от API', async () => {
    mockFetch({ error: 'Request quota exceeded!' })

    await expect(getBrands('0189')).rejects.toThrow('Request quota exceeded!')
  })

  it('при сбое сети выдаёт понятную ошибку', async () => {
    spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(getBrands('0189')).rejects.toThrow('Не удалось связаться с сервером')
  })
})

describe('getOffers', () => {
  it('запрашивает аналоги по номеру и бренду', async () => {
    const fetch = mockFetch({ goods: [] })

    await getOffers({ number: '0189', brand: 'NGK/NTK' })

    expect(requestParams(fetch).get('number')).toBe('0189')
    expect(requestParams(fetch).get('brand')).toBe('NGK/NTK')
    expect(requestParams(fetch).get('analogues')).toBe('on')
  })

  it('раскладывает деталь и аналоги по складским предложениям', async () => {
    mockFetch({
      goods: [
        item({
          price: 999, // общая цена товара: по документации её брать нельзя
          warehouses: [
            { id: 'w1', code: 'МСК', price: 100, stock: 3 },
            { id: 'w2', code: 'СПБ', price: 120, stock: 1 },
          ],
          analogues: [item({ goodsID: 'B', brand: 'CARGO', number: 'X1', name: 'Аналог' })],
        }),
      ],
    })

    expect(await getOffers({ number: '0189', brand: 'ZEN' })).toEqual([
      {
        id: 'A-w1',
        brand: 'ZEN',
        number: '0189',
        name: 'Бендикс',
        warehouse: 'МСК',
        price: 100,
        stock: 3,
      },
      {
        id: 'A-w2',
        brand: 'ZEN',
        number: '0189',
        name: 'Бендикс',
        warehouse: 'СПБ',
        price: 120,
        stock: 1,
      },
      {
        id: 'B',
        brand: 'CARGO',
        number: 'X1',
        name: 'Аналог',
        warehouse: '',
        price: null,
        stock: 0,
      },
    ])
  })
})
