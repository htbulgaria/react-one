import * as usersService from '../services/users';
import qs from 'qs'

export default {
	namespace: 'users',
	state: {
		list: [],
		total: null,
		page: null,
	},
	reducers: {
		save(state, { payload: { data: list, total, page } }) {
			return { ...state, list, total, page };
		},
	},
	effects: {
		*fetch({ payload: { page = 1 } }, { call, put }) {
			const { data, headers } = yield call(usersService.fetch, {page});
			yield put({ 
				type: 'save', 
				payload: { 
					data, 
					total: parseInt(headers['x-total-count'], 10),
					page: parseInt(page, 10), 
				} 
			});
		},
		*remove({ payload: id }, { call, put, select }){
			yield call(usersService.remove, id);
			const page = yield select(state => state.users.page);
			yield put({ type: 'fetch', payload: { page } });
		},
		*patch({ payload: { id, values } }, { call, put, select }) {
			yield call(usersService.patch, id, values);
			const page = yield select(state => state.users.page);
			yield put({ type: 'fetch', payload: { page } })
		},
	},
	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen((url) => {
				const { pathname, search } = url
				const query = qs.parse(search, { ignoreQueryPrefix: true })
				if (pathname === '/users' ) {
					dispatch({ type: 'fetch', payload: query || {} });
				}
			});
		},
	},
};