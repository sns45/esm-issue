<template>
	<div id="app">
		<h1>Edit this App.vue file</h1>
		<MyComponent :page-data="RssData"/>
	</div>
</template>

<script>

import MyComponent from './Component.vue';

export default {
	components: {
		MyComponent
	},


	 asyncData({ store }) {
	 return store.dispatch('getPosts');
	 },


	computed: {

		RssData() {
		    return this.$store.state.posts;
		},

	},
};
</script>
