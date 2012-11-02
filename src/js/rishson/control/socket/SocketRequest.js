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
		 * @name rishson.control.socket.SocketRequest.event
		 * @type {Object}
		 * @description The event encapsulates the topic to register an interest on.
		 * Must include a topic and any other key / value pairs that need to be registered on the server.
		 * 		{
		 * 			topic: <topic name>
		 * 			id: 123 // Example key value pair
		 * 		}
		 */
		event: null,

		/**
		 * @field
		 * @name rishson.control.socket.SocketRequest.callback
		 * @type {function(Object)}
		 * @description The callback excecuted when a registered interest event is received.
		 * Passed the payload received from the server.
		 */
		callback: null,

		/**
		 * @constructor
		 * @field parameters {Object}
		 */
		constructor: function (parameters) {
			this.event = parameters.event;
			this.callback = parameters.callback;
		}
	});
});