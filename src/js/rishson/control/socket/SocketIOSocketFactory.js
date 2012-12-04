define([
	"socket-io/dist/socket.io"
], function (socketio) {
	/**
	 * @class
	 * @name rishson.control.socket.SocketIOSocketFactory
	 * @description
	 */
	return {
		/**
		 * @function
		 * @name rishson.control.socket.SocketIOSocketFactory.create
		 * @param {string} baseUrl
		 * @return {Object} A SocketIO socket
		 */
		create: function (baseUrl) {
			return socketio.connect(baseUrl);
		}
	};
});