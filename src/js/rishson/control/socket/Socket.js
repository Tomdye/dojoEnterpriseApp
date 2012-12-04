define([
	"rishson/Globals",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/declare"
], function (Globals, lang, arrayUtil, declare) {
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
		 * @description The actual socket implementation.
		 */
		_socket: null,

		/**
		 * @field
		 * @name rishson.control.socket.Socket._socketRequests
		 * @type {Array.<rishson.control.socket.SocketRequest>}
		 */
		_socketRequests: null,

		/**
		 * @constructor
		 * @param {Object} socket
		 */
		constructor: function (socket) {
			this._socket = socket;
			this._socketRequests = [];
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
		 * @name rishson.control.socket.Socket.addInterest
		 * @param {rishson.control.socket.SocketRequest} request
		 */
		addInterest: function (request) {
			this._socketRequests.push(request);
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.removeInterest
		 * @param {rishson.control.socket.SocketRequest} request
		 */
		removeInterest: function (request) {
			var index = this._socketRequests.indexOf(request);

			if (index > -1) {
				this._socketRequests.splice(index, 1);
			}
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket._findInterested
		 * @param {string} topic
		 * @return {Array.<rishson.control.socket.SocketRequest>}
		 */
		_getSocketRequestsForTopic: function (topic) {
			return arrayUtil.filter(this._socketRequests, function (request) {
				return (request.topic === topic);
			});
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.registerTopic
		 * @param {string} topic
		 * @description Registers an 'on' event for the socket, binding the appropriate callback.
		 */
		registerTopic: function (topic) {
			this.on(topic, lang.hitch(this, "_callSocketRequestCallbacks", topic));
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.registerTopic
		 * @param {string} topic
		 * @param {*} data
		 * @description Checks if any current requests match the given topic, if so the requests
		 * callback is executed with the given payload.
		 */
		_callSocketRequestCallbacks: function (topic, data) {
			var socketRequests = this._getSocketRequestsForTopic(topic);

			arrayUtil.forEach(socketRequests, function (request) {
				request.callback.call(this, data);
			});
		}
	});
});