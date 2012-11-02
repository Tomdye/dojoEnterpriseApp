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
		_interests: null,

		/**
		 * @constructor
		 * @param {Object} socket
		 */
		constructor: function (socket) {
			this._socket = socket;
			this._interests = [];
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
			this._interests.push(request);
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.removeInterest
		 * @param {rishson.control.socket.SocketRequest} request
		 */
		removeInterest: function (request) {
			var index = this._interests.indexOf(request);

			if (index !== -1) {
				this._interests.splice(index, 1);
			}
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket._findInterested
		 * @param {string} topic
		 * @return {Array}
		 */
		_findInterested: function (topic) {
			return arrayUtil.filter(this._interests, function (interest) {
				return !!(interest.event.topic === topic);

				// TODO: Validate data against interest.event.entity
			});
		},

		/**
		 * @function
		 * @name rishson.control.socket.Socket.registerTopic
		 * @param {string} topic
		 * @description Registers an 'on' event for the socket. The callback checks if any requests
		 * are interested and if so the requests callback is executed with the server payload.
		 * the data.
		 */
		registerTopic: function (topic) {
			this.on(topic, lang.hitch(this, function (data) {
				var interested = this._findInterested(topic, data);

				arrayUtil.forEach(interested, function (interest) {
					interest.call(this, data.payload);
				});
			}));
		}
	});
});