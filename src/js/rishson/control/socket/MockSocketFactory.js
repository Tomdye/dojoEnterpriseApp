define([
], function () {

	/**
	 * @function
	 * @name rishson.control.socket.MockSocketFactory.MockSocket
	 * @description Mock socket implementation.
	 */
	var MockSocket = function () {
		this._onEvents = [];

		this.on = function (event, callback) {
			this._onEvents[event] = callback;
		};

		this.emit = function (event, data) {};

		this.dispatchEvent = function (event, data) {
			this._onEvents[event] && this._onEvents[event](data);
		};
	};
	/**
	 * @class
	 * @name rishson.control.SocketIOSocketFactory
	 * @description
	 */
	return {
		create: function (baseUrl) {
			// Bind all mock sockets to the window
			// so we can inject fake events into the application
			if (!window.mockSockets) {
				window.mockSockets = {};
			}

			var socket = new MockSocket(),
				app = baseUrl.split("/")[0]; // Use a friendly identifier for mocking

			window.mockSockets[app] = socket;

			return socket;
		}
	};
});