define([], function () {
	/**
	 * @class
	 * @name rishson.Base.lang
	 * @description A collection of language functions that can be mixed into other modules
	 */

		/**
		 * @function
		 * @name rishson.Base.lang._unionArrays
		 * @description Creates the union of two arrays
		 * @param {Array} x First array
		 * @param {Array} y Second array
		 * @return {Array} Merged array
		 **/
	var unionArrays = function (x, y) {
			var i,
				k,
				obj = {},
				res = [];

			for (i = x.length - 1; i >= 0; --i) {
				obj[x[i]] = x[i];
			}
			for (i = y.length - 1; i >= 0; --i) {
				obj[y[i]] = y[i];
			}

			for (k in obj) {
				if (obj.hasOwnProperty(k)) {
					res.push(obj[k]);
				}
			}
			return res;
		},

		/**
		 * @function
		 * @name rishson.Base.lang.forEachObjProperty
		 * @description Iterates through an object, calling the supplied callback function each time
		 * The callback is passed the current property and key, for each iteration
		 * @param {Object} obj Object to iterate over
		 * @param {Function} func Callback function to be executed on each iteration
		 * @return {Object} scope The scope to execute the callback within
		 **/
		forEachObjProperty = function (obj, func, scope) {
			var key;

			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					func.call(scope, obj[key], key);
				}
			}
		},

		/**
		 * @function
		 * @name rishson.Base.lang.find
		 * @description Looks through each value in the list, returning the first one that passes a truth test (iterator).
		 * The function returns as soon as it finds an acceptable element, and doesn't traverse the entire list.
		 * @param {Object} obj Object to iterate over, either Array or Map
		 * @param {Function} iterator Should return either true or false depending on whether there is a match
		 * @return {Object} scope The scope to execute the callback within
		 **/
		find = function (obj, iterator, scope) {
			var key,
				found = false,
				result = null;

			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					found = iterator.call(scope, obj[key], key);
					if (found === true) {
						result = obj[key];
						break;
					}
				}
			}
			return result;
		},

		/**
		 * @function
		 * @name rishson.Base.lang.defer
		 * @description Defers a function, scheduling it to run after the current call stack has cleared
		 * @param {Function} func The function to be called
		 * @param {Object} scope Optional scope for the function to be called within
		 **/
		defer = function (func, scope) {
			return setTimeout(function () {
				return func.apply(scope);
			}, 0);
		},

		lang = {
			unionArrays: unionArrays,
			forEachObjProperty: forEachObjProperty,
			defer: defer,
			find: find
		};

	return lang;
});