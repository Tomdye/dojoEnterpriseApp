define([
	"dojo/_base/declare"
], function (declare) {
	/**
	 * @class
	 * @name rishson.control.socket.SocketRequest
	 */
	return declare('rishson.control.SocketRequest', null, {
		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.type
		 * @type {string}
		 * @description The request type.
		 */
		type: null,

		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.event
		 * @type {string}
		 * @description The event to register an interest on.
		 */
		event: null,

		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.callback
		 * @type {function}
		 * @description The callback excecuted when a registered interest event is received.
		 */
		callback: null,

		/**
		 * @constructor
		 * @field parameters {Object}
		 */
		constructor: function (parameters) {
			this.type = parameters.type;
			this.event = parameters.event;
			this.callback = parameters.callback;
		}
	});
});