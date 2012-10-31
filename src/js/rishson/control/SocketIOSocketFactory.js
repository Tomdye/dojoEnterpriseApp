define([
	"dojox/socket"
], function (socket) {
	/**
	 * @class
	 * @name rishson.control.SocketIOSocketFactory
	 * @description
	 */
	return {
		create: function () {
			var supportsWebSockets = (typeof WebSocket !== "undefined");
			//noinspection JSValidateTypes
			var socket = socket({
				url: supportsWebSockets ? "/socket.io/websocket" : "/socket.io/xhr-polling",
				headers: {
					"Content-Type": "application/x-www-urlencoded"
				},
				transport: function (args, message) {
					args.content = message;
					dojo.xhrPost(args);
				}
			});
			return socket;
		}
	};
});