import { describe, expect, it } from 'bun:test'

import reducer, { fetchBrands, fetchOffers } from './searchSlice'

const initialState = reducer(undefined, { type: 'init' })

describe('searchSlice', () => {
  it('загрузка, затем успех', () => {
    let state = reducer(initialState, fetchBrands.pending('r1', '0189'))
    expect(state.brands.status).toBe('loading')

    state = reducer(state, fetchBrands.fulfilled([{ brand: 'ZEN' }], 'r1', '0189'))
    expect(state.brands).toMatchObject({ status: 'succeeded', items: [{ brand: 'ZEN' }] })
  })

  it('загрузка, затем ошибка с текстом', () => {
    let state = reducer(initialState, fetchBrands.pending('r1', '0189'))
    state = reducer(state, fetchBrands.rejected(new Error('Empty key!'), 'r1', '0189'))

    expect(state.brands).toMatchObject({ status: 'failed', error: 'Empty key!' })
  })

  it('игнорирует ответ на устаревший запрос', () => {
    let state = reducer(initialState, fetchOffers.pending('old', { brand: 'ZEN' }))
    state = reducer(state, fetchOffers.pending('new', { brand: 'CAFFARO' }))
    state = reducer(state, fetchOffers.fulfilled(['offer'], 'old', { brand: 'ZEN' }))

    expect(state.offers).toMatchObject({
      status: 'loading',
      items: [],
      params: { brand: 'CAFFARO' },
    })
  })

  it('новый поиск по артикулу сбрасывает старые предложения', () => {
    let state = reducer(initialState, fetchOffers.pending('r1', { brand: 'ZEN' }))
    state = reducer(state, fetchOffers.fulfilled(['offer'], 'r1', { brand: 'ZEN' }))
    state = reducer(state, fetchBrands.pending('r2', '0190'))

    expect(state.offers).toEqual(initialState.offers)
  })
})
