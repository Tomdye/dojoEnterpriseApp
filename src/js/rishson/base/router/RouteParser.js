define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/json",
	"dojo/io-query",
	"rishson/base/lang",
	"dojo/_base/array"
], function (declare, lang, json, ioQuery, rishsonLang, arrayUtil) {
	/**
	 * @class
	 * @name rishson.base.router.RouterParser
	 * @description Provides utility functions for reading and setting the hash.
	 * The general idea of the parser is that it provides an API to deal with
	 * Widgets as opposed to Strings.
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

		_deserialize = function (string) {
			try {
				return json.parse(string);
			} catch (e) {
				return {};
			}
		};

	return declare('rishson.base.router.HashParser', null, {
		_itemDelimiter: "/",

		_parameterDelimiter: "=",

		/**
		 * @field
		 * @private
		 * @description The modifier object is used to GET and SET the actual URL
		 */
		_urlModifier: null,

		constructor: function (urlModifier) {
			if (!urlModifier) {
				throw new Error("URLModifier required.");
			}

			this._urlModifier = urlModifier;
		},

		_getItem: function (route, offset) {
			offset = offset || 0;
			var hashArray = this._urlModifier.get().split(this._itemDelimiter),
				strippedArray = lang.clone(hashArray),
				length = strippedArray.length,
				widgetIndex,
				i = 0;

			// Loop through all items and strip any parameters
			for (i; i < length; i += 1) {
				strippedArray[i] = strippedArray[i].split(this._parameterDelimiter)[0];
			}

			widgetIndex = strippedArray.indexOf(route.getRouteName());

			if (widgetIndex !== -1 && hashArray[widgetIndex + offset]) {
				// Return the original hashArray so that parameters are included
				return hashArray[widgetIndex + offset];
			}
			return null;
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
				child = child.split(this._parameterDelimiter)[0]; // Strip parameters
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
				child = child.split(this._parameterDelimiter)[1]; // Strip name
				return _deserialize(child);
			}
			return {};
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.resolveRoute
		 * @param {rishson.base.router.Route} route A route
		 * @description Constructs a complete hash that routes to the given widget.
		 * @return {String} The route string.
		 */
		resolveRoute: function (route) {
			var hash = "",
				buffer = "";

			// While we have a route
			// we work up the chain to construct the hash
			while (route !== null) {
				buffer = route.getRouteName();
				if (route.getRouteParameters()) {
					buffer += this._parameterDelimiter + _serialize(route.getRouteParameters());
				}
				buffer += this._itemDelimiter;

				hash = buffer + hash;
				route = route.getParentRoute();
			}
			return hash;
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.set
		 * @param {String} route The new route
		 * @description Updates the hash in the browser.
		 */
		set: function (route) {
			this._urlModifier.set(route);
		},

		/**
		 * @function
		 * @name rishson.base.router.RouterParser.get
		 * @description Returns the hash.
		 */
		get: function () {
			return this._urlModifier.get();
		}
	});
});