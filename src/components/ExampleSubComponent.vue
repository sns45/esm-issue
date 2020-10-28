<template>
	<div class="newsContainer">
		<h3>Posts</h3>
		<ul
			v-for="post in RssData"
			:key="post.id">
			<li>
				<h1>{{ post.title }}</h1>
				<p>{{ post.body }}</p>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: {
		rss: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	data() {
		return {
			items: [],
		};
	},
	computed: {
		RssData() {
			return this.rss;
		},
	},
};
</script>

<style>
.newsContainer {
	text-align: center;
}
</style>
