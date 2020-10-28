/* eslint-disable no-param-reassign */
/* eslint no-unused-vars: ["error", {"args": "none"}] */
/* eslint max-len: ["error", { "code": 200, "tabWidth": 4 }] */
/* eslint camelcase: [2, {
	"allow": ["i_chronicle_id", "module_chronic_id", "chronic_id"]
}] */
/* eslint no-underscore-dangle: [2, {
	"allow": ["_chronic_id"]
}] */
import axios from 'axios';

const state = {
	friendlyURLData: {},
	modules: {},
};

function search(obj, predicate) {
	let result = [];
	// eslint-disable-next-line no-restricted-syntax,line-comment-position
	for (const p in obj) { // iterate on every property
		// tip: here is a good idea to check for hasOwnProperty
		// eslint-disable-next-line line-comment-position
		if (typeof (obj[p]) === 'object') { // if its object - lets search inside it
			result = result.concat(search(obj[p], predicate));
		} else if (predicate(p, obj[p])) {
			result.push(
				obj,
			);
		}
	}
	return result;
}


/**
 * removes null, empty, undefined kv pairs
 * @param object
 */
function clean(object) {
	Object.entries(object).forEach(([k, v]) => {
		if (v && typeof v === 'object') {
			clean(v);
		}
		// eslint-disable-next-line no-mixed-operators
		if (v && typeof v === 'object' && !Object.keys(v).length || v === null || v === undefined) {
			if (Array.isArray(object)) {
				object.splice(k, 1);
			} else {
				// eslint-disable-next-line no-param-reassign
				delete object[k];
			}
		}
	});
	return object;
}




const mutations = {

};

/**
 * @type {{getPageAndMetaData: actions.getPageAndMetaData}}
 * should contain only 1 API call to SOLR.
 */
const actions = {
	/**
	 * This is called by asyncData() of cms-router
	 */
	getPageAndMetaData: ({ commit }) => axios.get('https://jsonplaceholder.typicode.com/posts').then((response) => {
		if (response.statusText === 'OK') {
			commit('POSTS', response.data);
		}
	}).catch((error) => {
		console.log(error);
	})
};



export default {
	namespaced: true,
	state,
	actions,
	mutations,
};
