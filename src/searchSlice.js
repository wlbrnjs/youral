import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getBrands, getOffers } from './api';

export const fetchBrands = createAsyncThunk('search/fetchBrands', getBrands);
export const fetchOffers = createAsyncThunk('search/fetchOffers', getOffers);

// Состояние одного запроса к API.
// status: 'idle' (ещё не искали) | 'loading' | 'succeeded' | 'failed'
// params: с чем вызвали запрос (номер детали или выбранная позиция)
const emptyRequest = { status: 'idle', items: [], error: null, params: null, requestId: null };

// Общая логика для любого запроса: загрузка -> успех или ошибка
function addRequestCases(builder, thunk, key) {
  builder
    .addCase(thunk.pending, (state, action) => {
      state[key] = { ...emptyRequest, status: 'loading', params: action.meta.arg, requestId: action.meta.requestId };
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return; // пользователь уже начал новый запрос
      state[key].status = 'succeeded';
      state[key].items = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return;
      state[key].status = 'failed';
      state[key].error = action.error.message;
    });
}

const searchSlice = createSlice({
  name: 'search',
  initialState: { brands: emptyRequest, offers: emptyRequest },
  reducers: {},
  extraReducers: (builder) => {
    addRequestCases(builder, fetchBrands, 'brands');
    addRequestCases(builder, fetchOffers, 'offers');

    // Новый поиск по артикулу - старые предложения больше не актуальны
    builder.addMatcher(fetchBrands.pending.match, (state) => {
      state.offers = emptyRequest;
    });
  },
});

export const selectBrands = (state) => state.search.brands;
export const selectOffers = (state) => state.search.offers;

export default searchSlice.reducer;
