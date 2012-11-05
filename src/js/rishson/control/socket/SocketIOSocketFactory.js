define([
	"dojox/socket"
], function (socket) {
	/**
	 * @class
	 * @name rishson.control.socket.SocketIOSocketFactory
	 * @description
	 */
	return {
		/**
		 * @function
		 * @name rishson.control.socket.SocketIOSocketFactory.create
		 * @return {Object} A SocketIO socket
		 */
		create: function () {
			var supportsWebSockets = (typeof WebSocket !== "undefined");

			//noinspection JSValidateTypes
			return socket({
				url: supportsWebSockets ? "/socket.io/websocket" : "/socket.io/xhr-polling",
				headers: {
					"Content-Type": "application/x-www-urlencoded"
				},
				transport: function (args, message) {
					args.content = message;
					dojo.xhrPost(args);
				}
			});
		}
	};
});