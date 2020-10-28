<template>
	<div>
		<ExampleSubComponent :rss="RssData"></ExampleSubComponent>
		<NoSsr>
			<p>This line does NOT render server side because its wrapped between &lt;NoSsr&gt; tags.</p>
		</NoSsr>
	</div>
</template>

<script>
import NoSsr from 'vue-no-ssr';
import ExampleSubComponent from './components/ExampleSubComponent.vue';

export default {
	data() {
		return {
			msg: 'This is a vue Page',
		};
	},

	components: {
		ExampleSubComponent,
		NoSsr,
	},

	props: {
		pageData: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	computed: {

		RssData() {
		  return this.pageData
		},

	},
};
</script>

<style lang="scss" scoped>
</style>
