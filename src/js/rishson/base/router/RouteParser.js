define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/json"
], function (declare, lang, json) {
	/**
	 * @class
	 * @name rishson.base.router.RouterParser
	 * @description Provides utility functions for reading and setting the hash.
	 * The general idea of the parser is that it provides an API that deals with
	 * Routes.
	 */
		/**
		 * @field
		 * @private
		 * @description Strips any parameters from a child in a route
		 */
	var _serialize = function (object) {
			try {
				return json.stringify(object);
			} catch (e) {
				return "{}";
			}
		},

		/**
		 * @field
		 * @private
		 * @description Deserializes any parameters from a child in a route
		 */
		_deserialize = function (string) {
			try {
				return json.parse(string);
			} catch (e) {
				return null;
			}
		};

	return declare("rishson.base.router.RouteParser", null, {
		/**
		 * @const
		 * @description
		 */
		ITEM_DELIMITER: "/",

		/**
		 * @const
		 * @description
		 */
		PARAM_DELIMITER: "=",

		/**
		 * @field
		 * @private
		 * @description The modifier object is used to GET and SET the actual URL
		 */
		_urlModifier: null,

		/**
		 * @constructor
		 * @param {Object} urlModifier
		 */
		constructor: function (urlModifier) {
			if (!urlModifier) {
				throw new Error("URLModifier required.");
			}

			this._urlModifier = urlModifier;
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser._getItem
		 * @param {rishson.base.router.Route} route A route
		 * @param {number=} offset (optional)
		 * @description Gets the full item
		 * @return {string}
		 */
		_getItem: function (route, offset) {
			offset = offset || 0;
			var hashArray = this._urlModifier.get().split(this.ITEM_DELIMITER),
				strippedArray = lang.clone(hashArray),
				length = strippedArray.length,
				widgetIndex,
				i = 0;

			// Strip any parameters
			for (i; i < length; i += 1) {
				strippedArray[i] = strippedArray[i].split(this.PARAM_DELIMITER)[0];
			}

			widgetIndex = strippedArray.indexOf(route.getRouteName());

			if (widgetIndex !== -1 && hashArray[widgetIndex + offset]) {
				// We return from the original hashArray so that parameters are included
				return hashArray[widgetIndex + offset];
			}
			return null;
		},

		getModifier: function () {
			return this._urlModifier;
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.getChildName
		 * @param {rishson.base.router.Route} route A route
		 * @description Gets the name of a hashItem child of a given widget.
		 */
		getChildName: function (route) {
			var child = this._getItem(route, 1);

			if (child) {
				child = child.split(this.PARAM_DELIMITER)[0]; // Strip parameters
				return child;
			}
			return null;
		},

		/**
		 * @function
		 * @name rishson.router.RouterParser.hasChild
		 * @param {rishson.base.router.Route} route A route
		 * @description Returns a boolean denoting whether the route contains a child in the hash.
		 * @return {boolean}
		 */
		hasChild: function (route) {
			return !!this._getItem(route, 1);
		},

		getParameters: function (route) {
			var child = this._getItem(route);

			if (child) {
				child = child.split(this.PARAM_DELIMITER)[1]; // Strip name
				return _deserialize(child);
			}
			return null;
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.resolveRoute
		 * @param {rishson.base.router.Route} route A route
		 * @description Constructs a complete route string for the given route object
		 * @return {string}
		 */
		resolveRoute: function (route) {
			var routeString = "",
				buffer = "";

			// While we have a route
			// we work up the chain to construct the route string
			while (route !== null) {
				buffer = route.getRouteName();
				if (route.getRouteParameters()) {
					buffer += this.PARAM_DELIMITER + _serialize(route.getRouteParameters());
				}
				buffer += this.ITEM_DELIMITER;

				routeString = buffer + routeString;
				route = route.getParentRoute();
			}
			return routeString;
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.resolveRoute
		 * @param {rishson.base.router.Route} route A route
		 * @description Returns the first item in the child
		 * @return {string}
		 */
		getFirstChild: function () {
			var firstItem = this.get().split(this.ITEM_DELIMITER)[0];

			return firstItem.split(this.PARAM_DELIMITER)[0] || null; // Strip params
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.set
		 * @param {string} route The new route
		 * @description Updates the hash in the browser.
		 */
		set: function (route) {
			this._urlModifier.set(route);
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.get
		 * @description Returns the hash.
		 * @return {string}
		 */
		get: function () {
			return this._urlModifier.get();
		}
	});
});