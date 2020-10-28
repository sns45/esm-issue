const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals');
const merge = require('lodash.merge');
const path = require('path');
// eslint-disable-next-line
const webpack = require('webpack');

const mapToFolder = (dependencies, folder) => dependencies.reduce((acc, dependency) => ({
	[dependency]: path.resolve(`${folder}/${dependency}`),
	...acc,
}), {});

const { dependencies } = require('./package.json');

const TARGET_NODE = process.env.WEBPACK_TARGET === 'node';

const createApiFile = TARGET_NODE
	? './create-api-server.js'
	: './create-api-client.js';

const target = TARGET_NODE
	? 'server'
	: 'client';

const isProd = process.env.NODE_ENV === 'production';

const devtool = !isProd ? 'eval-source-map' : undefined;

const outputDevtoolConfig = !isProd ? {
	devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]',
	devtoolModuleFilenameTemplate: (info) => {
		const isVue = info.resourcePath.match(/\.vue$/);
		const isScript = info.query.match(/type=script/);
		const hasModuleId = info.moduleId !== '';

		// Detect generated files, filter as webpack-generated
		if (isVue

			// Must not be 'script' files (enough for chrome), or must have moduleId (firefox)
			&& (!isScript || hasModuleId)
		) {
			const pathParts = info.resourcePath.split('/');
			const baseName = pathParts[pathParts.length - 1];

			// prepend 'gen-' to filename as well, so it's easier to find desired files via Ctrl+P
			pathParts.splice(-1, 1, `gen-${baseName}`);
			return `webpack-generated:///${pathParts.join('/')}?${info.hash}`;
		}

		// If not generated, filter as webpack-vue
		return `webpack-vue:///${info.resourcePath}`;
	},
} : undefined;

/**
 * Setting up client and server build configuration in one file over here.
 * More info: https://ssr.vuejs.org/guide/build-config.html#server-config
 * More info: https://ssr.vuejs.org/guide/build-config.html#client-config
 */
module.exports = {
	runtimeCompiler: true,
	publicPath: isProd ? `/static_vue/xyz/` : '/',
	outputDir: `dist/xyz/`,
	devServer: {
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	},
	transpileDependencies: [/\.jsx/, /\.es6\.js/, /pagedata.js/, /store.js/, /router.js/, /css-line-break/],

	/**
	 * Source maps only be served in production mode if process.env.SOURCE_MAPS is set to "yes"
	 */
	productionSourceMap: true,

	configureWebpack: () => ({
		/**
		 * Development mode
		 */
		// mode: TARGET_NODE ? undefined : 'development',

		/**
		 * Entry points for server and client
		 */
		entry: `./scripts/entry-${target}`,

		/**
		 * inline source maps are generated in debug mode but not in prod mode
		 */
		devtool,


		/**
		 * building for server or client?
		 */
		target: TARGET_NODE ? 'node' : 'web',

		/**
		 * Node server or not
		 */
		node: TARGET_NODE ? undefined : false,

		/**
		 * define a required pre-requisite for vue-server-renderer
		 */
		plugins: [
			TARGET_NODE
				? new VueSSRServerPlugin()
				: new VueSSRClientPlugin(),
		],

		externals: TARGET_NODE ? nodeExternals({
			whitelist: [/\.css$/, /\.vue$/, /src\/store$/, /src\/router$/, /util\/pagedata$/, /\.es6$/, /lib\/dfp$/, /css-line-break/],
		}) : undefined,

		/**
		 * CommonJS when bundling Server side and default for client side
		 */
		output: {
			libraryTarget: TARGET_NODE ? 'commonjs2' : undefined,

			/**
			 * Custom settings for source map generation to avoid cases when there is no way to debug
			 * vuejs file in Chrome if another vuejs file with same name is loaded.
			 */
			...outputDevtoolConfig,

			/**
			 * Do not rename or add random number to the dist files
			 *
			 * filename: '[name].js',
			 * chunkFilename: '[name].js',
			 */
		},


		optimization: {
			// eslint-disable-next-line no-nested-ternary
			splitChunks: TARGET_NODE ? false : !isProd ? undefined : {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/](asdf-elements)[\\/]/,
						name: 'asdf-elements',
						chunks: 'all',
					},
				},
			},
		},

		resolve: {
			alias: {
				'create-api': createApiFile,

				/**
				 * This will create alias of all the dependencies in the node_modules
				 * so that it refers to one version that is defined in the main package.json
				 * This will ensure that the page and the component uses the same version of dependencies.
				 * More info : https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7
				 */
				...mapToFolder(Object.keys(dependencies), `${process.cwd()}/node_modules`),
			},

			// symlinks : false,
		},
	}),

	/**
	 * Turn off optimize SSR
	 * ON will only give a bundle which is only compatible to serve SSR and not CSR.
	 * Therefore, we are turning it off so that it can be rendered on SSR as well as CSR.
	 * More info: https://vue-loader.vuejs.org/options.html#optimizessr
	 */
	chainWebpack: (config) => {
		config.module
			.rule('vue')
			.use('vue-loader')
			.tap(options => merge(options, {
				optimizeSSR: false,
			}));
	},
};
