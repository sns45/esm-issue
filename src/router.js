import Vue from 'vue';
import Router from 'vue-router';
import component from './RouterComponent.vue';

Vue.use(Router);

export default function () {
	return new Router({
		mode: 'history',
		routes: [
			{
				path: '/assetid-:articleid',
				component,
			},
			{
				path: '/assetid-:articleid/:channelid',
				component,
			},
		],
	});
}
