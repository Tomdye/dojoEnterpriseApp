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
			this._sockets[appId] = this._socketFactory.create(appId);
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
				handlerEventCallback,
				i = 0,
				length = eventHandlers.length;

			// Register the event handlers on the applications socket
			if (socket) {
				for (i; i < length; i += 1) {
					event = eventHandlers[i].event;
					handlerEvent = eventHandlers[i].handlerEvent,
					handlerEventCallback = this._createEventHandlerCallback(appId, handlerEvent);

					socket.on(event, handlerEventCallback);
				}
			}
		},

		_createEventHandlerCallback: function (appId, handlerEvent) {
			// Create a closure callback that is passed the
			// handlerEvent and the appId.
			return lang.hitch(this, function (appId, handlerEvent, data) {
				// If a function was passed as the handlerEvent we
				// use this to calculate the event string.
				// This is because the event can be dynamic and usually dependent
				// on some propery contained in the data i.e an `id` property.
				if (lang.isFunction(handlerEvent)) {
					handlerEvent = handlerEvent(data);
				}
				handlerEvent = appId + "/" + handlerEvent; // Prepend namepsace

				this.dispatch(handlerEvent, data);
			}, appId, handlerEvent);
		},

		dispatch: function (event, data) {
			topic.publish(event, data);
		},

		getSocket: function (appId) {
			return this._sockets[appId];
		}
	});
});