define([
	"dojo/_base/declare"
], function (declare) {
	/**
	 * @class
	 * @name rishson.control.socket.SocketRequest
	 * @description Simple wrapper for a socket requesting an interest on a topic.
	 */
	return declare('rishson.control.SocketRequest', null, {
		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.topic
		 * @type {string}
		 * @description
		 */
		topic: null,

		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.identifier
		 * @type {string}
		 * @description
		 */
		identifier: null,

		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.callback
		 * @type {function(*)}
		 * @description The callback excecuted when a registered interest event is received.
		 * Passed the payload received from the server.
		 */
		callback: null,

		/**
		 * @constructor
		 * @field {topic} string
		 * @field {topic} string
		 * @field {function(*)} callback
		 */
		constructor: function (topic, identifier, callback) {
			this.topic = topic;
			this.identifier = identifier;
			this.callback = callback;
		},

		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.toJSON
		 * @return {Object}
		 */
		toJSON: function () {
			return {
				topic: this.topic,
				identifier: this.identifier
			};
		}
	});
});