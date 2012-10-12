define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic",
	"rishson/Globals",
	"rishson/base/router/RouteParser",
	"rishson/base/router/hashURLModifier"
], function (declare, lang, topic, Globals, RouteParser, hashUrlModifier) {
	/**
	 * @class
	 * @name rishson.base.router.Router
	 * @description Used to start the router for an implementing class. There must be only
	 * one instance of Router per application.
	 */
	return declare('rishson.base.router.Router', null, {
		/**
		 * @field
		 * @name rishson.base.router.Router._lastRoute
		 * @type {String}
		 * @private
		 * @description The most recent silently-set route.
		 * This is used to suppress the event that this change created
		 */
		_lastRoute: null,

		/**
		 * @field
		 * @name rishson.base.router.Router._onRouteChange
		 * @type {Function}
		 * @private
		 * @description A function executed every time the route changes manually. This must be passed in
		 * to the constructor. The function should kick start the routing change by calling display on the
		 * first item in the new route.
		 */
		_onRouteChange: null,

		parser: null,

		constructor: function (params) {
			this._onRouteChange = params.onRouteChange;
			this.parser = new RouteParser(hashUrlModifier);
		},

		/**
		 * @function
		 * @name rishson.base.router.Router.start
		 * @description Starts up the router listening on the silent route update and route changed topics.
		 * This should be only ever be called once as subscriptions are application-wide.
		 */
		start: function () {
			topic.subscribe(this.parser.getModifier().CHANGE_EVENT, lang.hitch(this, function (route) {
				if (route !== this._lastRoute) {
					this._onRouteChange(this.parser.getFirstChild());
				}
			}));

			topic.subscribe(Globals.UPDATE_ROUTE, lang.hitch(this, function (params) {
				var route = params.route;

				this._lastRoute = route;
				this.parser.set(route);
			}));
		}
	});
});