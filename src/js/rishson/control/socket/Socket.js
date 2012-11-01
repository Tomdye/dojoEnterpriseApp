define([
	"rishson/Globals",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/topic"
], function (Globals, lang, arrayUtil, declare, topic) {
	/**
	 * @class
	 * @name rishson.control.socket.Socket
	 * @description
	 */
	return declare("rishson.control.socket.Socket", null, {
		/**
		 * @field
		 * @name rishson.control.socket.Socket._socket
		 * @type {Object}
		 * @description The real socket implementation.
		 */
		_socket: null,

		/**
		 * @field
		 * @name rishson.control.socket.Socket._eventCallbacks
		 * @type {Object}
		 * @description A map of interest events to callback functions.
		 */
		_eventCallbacks: null,

		/**
		 * @constructor
		 * @param {Object} socket
		 */
		constructor: function (socket) {
			this._socket = socket;
			this._eventCallbacks = {};
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.emit
		 * @param {string} event
		 * @param {Object} data
		 * @description Proxy for socket emit.
		 */
		emit: function (event, data) {
			this._socket.emit(event, data);
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.on
		 * @param {string} event
		 * @param {function} callback
		 * @description Proxy for socket on.
		 */
		on: function (event, callback) {
			this._socket.on(event, callback);
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.addEventCallback
		 * @param {string} event
		 * @param {function} callback
		 */
		addEventCallback: function (event, callback) {
			this._eventCallbacks[event] = callback;
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.removeEventCallback
		 * @param {string} event
		 */
		removeEventCallback: function (event) {
			delete this._eventCallbacks[event];
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.getEventCallback
		 * @param {string} event
		 * @return {function}
		 */
		getEventCallback: function (event) {
			return this._eventCallbacks[event];
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.registerEvent
		 * @param {string} event
		 * @return {(string|function)} interestEvent This is usually a function to dynamically
		 * generate the interestEvent. If it is a function it is passed the data from the server.
		 * @description Registers an 'on' event for the socket. The callback checks if an
		 * interest event has been registered for the response. If so it is executed and passed
		 * the data.
		 */
		registerEvent: function (event, interestEvent) {
			this.on(event, lang.hitch(this, function (data) {
				var resolvedInterestEvent,
					callback;

				if (lang.isFunction(interestEvent)) {
					resolvedInterestEvent = interestEvent(data);
				} else {
					resolvedInterestEvent = interestEvent;
				}

				callback = this.getEventCallback(resolvedInterestEvent);

				if (callback) {
					callback(data);
				}
			}));
		}
	});
});