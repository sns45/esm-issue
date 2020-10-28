import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import App from './App.vue';
import createRouter from './router';
import createStore from './store/index.js';

// eslint-disable-next-line import/prefer-default-export
export function createApp() {
	const store = createStore();
	const router = createRouter();

	sync(store, router);

	const app = new Vue({
		router,
		store,
		render: h => h(App),
	});

	return { app, router, store };
}
