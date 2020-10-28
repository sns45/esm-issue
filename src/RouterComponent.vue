<template>
	<div data-e2e="cms-router"></div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	asyncData({
		store, route, host, env, app
	}) {
		return store.dispatch('cms/getPageAndMetaData', { route, host, env, app });
	}
};
</script>
