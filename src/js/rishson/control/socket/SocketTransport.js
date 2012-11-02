define([
	"rishson/Globals",
	"rishson/control/socket/Socket",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/topic"
], function (Globals, Socket, lang, arrayUtil, declare, topic) {
	/**
	 * @class
	 * @name rishson.control.socket.SocketTransport
	 * @description
	 */
	return declare('rishson.control.socket.SocketTransport', null, {
		/**
		 * @field
		 * @name rishson.control.socket.SocketTransport._socketFactory
		 * @type {Object}
		 * @description An implementation of a socket factory.
		 */
		_socketFactory: null,

		/**
		 * @field
		 * @name rishson.control.socket.SocketTransport._sockets
		 * @type {Object}
		 * @description A map of application id's to sockets.
		 */
		_sockets: null,

		/**
		 * @constructor
		 * @param {Object} socketFactory
		 */
		constructor: function (socketFactory) {
			if (!socketFactory) {
				throw new Error("No socket factory implementation passed to constructor.");
			}
			this._socketFactory = socketFactory;
			this._sockets = {};
		},

		/**
		 * @function
		 * @name rishson.control.socket.SocketTransport.createSocketForApp
		 * @param {string} appId
		 */
		createSocketForApp: function (appId) {
			var socket = this._socketFactory.create(appId);

			this.addSocket(appId, new Socket(socket));
		},

		/**
		 * @function
		 * @name rishson.control.socket.SocketTransport.registerInterest
		 * @param {string} appId
		 * @param {rishson.control.socket.SocketRequest} request
		 * @description Emits a register interest event to the server stating that we want to receive updates
		 * on the supplied event.
		 */
		registerInterest: function (appId, request) {
			var socket = this.getSocket(appId);

			if (socket) {
				socket.emit(Globals.SOCKET_EVENTS.REGISTER_INTEREST, request.event);
				socket.addInterest(request);
			}
		},

		/**
		 * @function
		 * @name rishson.control.socket.SocketTransport.deregisterInterest
		 * @param {string} appId
		 * @param {rishson.control.socket.SocketRequest} request
		 * @description Emits a deregister interest event to the server stating that we no longer want to
		 * receive updates on the supplied event.
		 */
		deregisterInterest: function (appId, request) {
			var socket = this.getSocket(appId);

			if (socket) {
				socket.emit(Globals.SOCKET_EVENTS.DEREGISTER_INTEREST, request.event);
				socket.removeInterest(request);
			}
		},

		/**
		 * @function
		 * @name rishson.control.socket.SocketTransport.registerTopics
		 * @param {string} appId
		 * @param {Array} topics
		 * @description Subscribes an applications socket to the supplied events.
		 */
		registerTopics: function (appId, topics) {
			var socket = this.getSocket(appId),
				i = 0,
				length = topics.length;

			if (socket) {
				for (i; i < length; i += 1) {
					socket.registerTopic(topics[i]);
				}
			}
		},

		/**
		 * @function
		 * @name rishson.control.socket.SocketTransport.addSocket
		 * @param {string} appId
		 * @param {rishson.control.socket,Socket} socket
		 */
		addSocket: function (appId, socket) {
			this._sockets[appId] = socket;
		},

		/**
		 * @function
		 * @name rishson.control.socket.SocketTransport.getSocket
		 * @param {string} appId
		 * @description Returns an applications socket.
		 * @return {rishson.control.Socket}
		 */
		getSocket: function (appId) {
			return this._sockets[appId];
		}
	});
});