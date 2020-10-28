/* eslint-disable no-console */

const fs = require('fs');

// eslint-disable-next-line
let errorUrl = 'https://www.xyz.com/500';

const path = require('path');
const express = require('express');
const proxy = require('http-proxy-middleware');
const { createBundleRenderer } = require('vue-server-renderer');


const devServerBaseURL = process.env.DEV_SERVER_BASE_URL || 'http://localhost';
const devServerPort = process.env.DEV_SERVER_PORT || 8081;
// eslint-disable-next-line prefer-destructuring
// eslint-disable-next-line import/no-dynamic-require
const clientManifest = require(`./dist/xyz/vue-ssr-client-manifest.json`);
// eslint-disable-next-line import/no-dynamic-require
const bundle = require(`./dist/xyz/vue-ssr-server-bundle.json`);

const app = express();

// eslint-disable-next-line no-shadow
function createRenderer(bundle, options) {
	return createBundleRenderer(bundle, Object.assign(options, {
		runInNewContext: 'once',
		inject: false,
	}));
}

const templatePath = path.resolve(__dirname, './src/index.template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

const renderer = createRenderer(bundle, {
	template,
	clientManifest
});


if (process.env.NODE_ENV !== 'production') {
	app.use('*/js/main*', proxy({
		target: `${devServerBaseURL}:${devServerPort}`,
		changeOrigin: true,
		// eslint-disable-next-line no-shadow
		pathRewrite(path) {
			return path.includes('main')
				? '/main.js'
				: path;
		},
		prependPath: false,
	}));

	app.use('/*hot-update*', proxy({
		target: `${devServerBaseURL}:${devServerPort}`,
		changeOrigin: true,
	}));


	app.use('/sockjs-node', proxy({
		target: `${devServerBaseURL}:${devServerPort}`,
		changeOrigin: true,
		ws: true,
	}));
}



app.use('/static_vue', express.static(path.resolve(__dirname, './dist')));





app.get('*', (req, res) => {
	const s = Date.now();

	res.setHeader('Content-Type', 'text/html');

	const context = {
		url: req.url,
		fullUrl: req.url,
		host: (req.headers || {}).host,
	};

	renderer.renderToString(context, (err, html) => {
		if (err) {
			if (process.env.ENV !== 'production') {
				res.status(500).end(`<html><body><pre>${err.stack}</pre></body></html>`);
			} else {
				res.redirect(302, errorUrl);
			}
		} else {
			console.log(`whole request: ${Date.now() - s}ms`);
			const currentTime = new Date();
			const epocTimeStamp = Math.floor(currentTime / 1000);
			const gmt = currentTime.toGMTString();
			res.set('ETag', epocTimeStamp);
			res.set('Last-Modified', gmt);
			res.set('Cache-Control', 'max-age=120, s-maxage=300, must-revalidate, stale-while-revalidate=30, stale-if-error=43200, public');
			res.end(html);
		}
	});
});

module.exports = app;
