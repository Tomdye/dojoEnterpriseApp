define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"rishson/base/lang",
	"rishson/util/ObjectValidator",
	"rishson/base/router/Route",
	"dojo/topic"
], function (declare, lang, arrayUtil, rishsonLang, Validator, Route, topic) {
	/**
	 * @class
	 * @name rishson.base.router.Route
	 * @description Defines a single, uni-directional route between two widgets
	 */
	return declare("rishson.base.router.Route", null, {
		/**
		 * @field
		 * @name rishson.base.router.Route._parser
		 * @type {rishson.base.router.HashParser}
		 * @description The hash parser
		 */
		_parser: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._parent
		 * @type {rishson.widget._Widget}
		 * @description The parent widget for this uni-directional route relationship,
		 * the parent setup the route for the widget
		 */
		_parent: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._child
		 * @type {rishson.widget._Widget}
		 * @description The widget for this uni-directional route relationship
		 */
		_widget: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._displayFn
		 * @type {Function}
		 * @description A reference to the original function that displays the widget to
		 * the end user.
		 */
		_displayFn: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._routeName
		 * @type {String}
		 * @description Used in the URL to define the path to this widget
		 */
		_routeName: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._options
		 * @type {Object}
		 * @description A hash of options for this route
		 */
		_options: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._parentRoute
		 * @type {rishson.base.router.Route}
		 * @description The parent route that this route belongs to. If this is not set
		 * then this route is assumed to be the 'master' route.
		 */
		_parentRoute: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._options
		 * @type {Object}
		 * @description A hash of the most recently set route parameters
		 */
		_widgetParameters: null,

		/**
		 * @constructor
		 * @param {Object} routeParams
		 * @param {rishson.base.router.HashParser} parser
		 */
		constructor: function (routeParams, parser) {
			this._parser = parser;
			this._widget = routeParams.widget;
			this._parent = routeParams.parent;
			this._routeName = routeParams.routeName;
			this._options = routeParams.options || {};
			this._displayFn = this._getDisplayFunction(routeParams.display);
			this._parentRoute = routeParams.parentRoute;
		},

		/**
		 * @function
		 * @name rishson.base.router.Route.display
		 * @param {Object} routeParameters Any programmatically passed parameters
		 * @description Called whenever a widget needs displaying to the end user.
		 * Before running the users actual display function, the current route is checked for a child.
		 * If a child is found then display is called on it first.
		 * @return {?} The return value that is returned by the native display function.
		 */
		display: function (routeParameters) {
			var route,
				childRouteName;

			// If the current URL has a child that belongs to this widget
			// then we call display on it

			if (this._parser.hasChild(this)) {
				childRouteName = this._parser.getChildName(this._widget);
				route = this._findRoute(this._widget.routes, childRouteName);

				if (route) {
					route.display();
				}
			} else {
				// We are either at the end of the routing chain
				// OR the method has been called programmatically

				// If parameters weren't given then
				// we try and parse some from the URL
				this._widgetParameters = lang.isObject(routeParameters) ?
						routeParameters : this._parser.getParameters(this);

				topic.publish("route/update", {
					route: this._parser.resolveRoute(this)
				});
			}

			// Call the original display function
			return this._displayFn.call(this._parent, this._widgetParameters, this._widget);
		},

		_findRoute: function (routes, name) {
			rishsonLang.forEachObjProperty(routes, function (route) {
				if (route.getRouteName() === name) {
					return route;
				}
			}, this);

			return null;
		},

		/**
		 * @function
		 * @name rishson.base.router.Route.getRouteName
		 * @private
		 * @description Returns the route name for this route.
		 * @return {String} The route name.
		 */
		getRouteName: function () {
			return this._routeName;
		},

		/**
		 * @function
		 * @name rishson.base.router.Route.getParentRoute
		 * @private
		 * @description Returns the route name for this route.
		 * @return {rishson.base.router.Route} The route.
		 */
		getParentRoute: function () {
			if (this._parentRoute) {
				return this._resolveParentRoute(this._parentRoute);
			}
			return null;
		},

		getRouteParameters: function () {
			return this._widgetParameters;
		},

		getRouteAsURLString: function () {
			return this._parser.resolveRoute(this);
		},

		_resolveParentRoute: function (parentRoute) {
			var widget = this._parent;

			if (!parentRoute) {
				return;
			}

			if (lang.isString(parentRoute)) {
				// String given, attempt to find the parent in the parent properties routes hash
				if (widget && widget.__parent__.routes[parentRoute]) {
					return widget.__parent__.routes[parentRoute];
				} else {
					console.error("Could not find parent route: " + parentRoute);
				}
			} else if (parentRoute.declaredClass === "rishson.base.router.Route") {
				// Else we were passed a route directly
				return parentRoute;
			}
			return null;
		},

		_getDisplayFunction: function (display) {
			if (lang.isFunction(display)) {
				// Function given, just cache it
				return display;
			} else if (lang.isString(display)) {
				// String given, find the function in the parents scope
				if (lang.isFunction(this._parent[display])) {
					return this._parent[display];
				} else {
					throw new Error("No function was found with the name: " + display);
				}
			}
		}
	});
});