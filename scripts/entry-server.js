/* eslint-disable */
import { createApp } from '../src/main';

export default context => new Promise((resolve, reject) => {
  const { app, router, store } = createApp();
  router.push(context.url);
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents();
    if (!matchedComponents.length) {
      return reject({ code: 404 });
    }
    // Call fetchData hooks on components matched by the route.
    // A preFetch hook dispatches a store action and returns a Promise,
    // which is resolved when the action is complete and store state has been
    // updated.
    Promise.all(matchedComponents.map((Component) => {
      if (Component.asyncData) {
        return Component.asyncData({
			app,
			store,
			route: router.currentRoute,
			env: context.env,
			url: context.url,
			host: context.host
		});
      }
    })).then(() => {
      // After all preFetch hooks are resolved, our store is now
      // filled with the state needed to render the app.
      // Expose the state on the render context, and let the request handler
      // inline the state in the HTML response. This allows the client-side
      // store to pick-up the server-side state without having to duplicate
      // the initial data fetching on the client.
      context.state = store.state;
      resolve(app);
    }).catch(reject);
  }, reject);
});
