import Vue from 'vue';
import Vuex from 'vuex';
import cms from './modules/cms.es6';

Vue.use(Vuex);

export default function () {
	return new Vuex.Store({
		modules: {
			cms,
		},
	});
}
