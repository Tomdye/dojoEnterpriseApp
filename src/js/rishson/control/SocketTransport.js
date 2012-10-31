define([
	"rishson/Globals",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/topic"
], function (Globals, lang, arrayUtil, declare, topic) {
	/**
	 * @class
	 * @name rishson.control.SocketTransport
	 * @description
	 */
	return declare('rishson.control.SocketTransport', null, {
		_socketFactory: null,

		_sockets: null,

		constructor: function (socketFactory) {
			if (!socketFactory) {
				throw new Error("No socket factory implementation passed to constructor");
			}
			this._socketFactory = socketFactory;
			this._sockets = {};
		},

		createSocket: function (appId) {
			this._sockets[appId] = this._socketFactory.create();
		},

		subscribe: function (appId, event) {
			var socket = this.getSocket(appId);

			if (socket) {
				socket.emit("SUBSCRIBE", event);
			}
		},

		unsubscribe: function (appId, event) {
			var socket = this.getSocket(appId);

			if (socket) {
				socket.emit("UNSUBSCRIBE", event);
			}
		},

		registerEventHandlers: function (appId, eventHandlers) {
			var socket = this.getSocket(appId),
				event,
				handlerEvent,
				i = 0,
				length = eventHandlers.length;

			// Register the event handlers for the apps socket
			if (socket) {
				for (i; i < length; i += 1) {
					event = eventHandlers[i].event;
					handlerEvent = eventHandlers[i].handlerEvent;

					socket.on(event, this._createEventHandlerCallback(handlerEvent));
				}
			}
		},

		_createEventHandlerCallback: function (handlerEvent) {
			return lang.hitch(this, function (handlerEvent, data) {
				// If a function was passed as the handlerEvent we
				// use this to calculate the event string.
				// This is because the event is dynamic and usually dependent
				// on some propery contained in the data i.e an id field.
				if (lang.isFunction(handlerEvent)) {
					handlerEvent = handlerEvent(data);
				}
				this.dispatch(handlerEvent, data);
			}, handlerEvent);
		},

		dispatch: function (event, data) {
			topic.publish(event, data);
		},

		getSocket: function (appId) {
			return this._sockets[appId];
		}
	});
});