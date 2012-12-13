define([
	"rishson/Globals",
	"rishson/control/LoginResponse",
	"rishson/control/socket/SocketTransport",
	"rishson/util/ObjectValidator",	//validate
	"dojo/_base/lang",	// mixin, hitch
	"dojo/_base/array",	// indexOf, forEach
	"dojo/_base/declare",	// declare
	"dojo/topic"	// publish/subscribe
], function (Globals, LoginResponse, SocketTransport, ObjectValidator, lang, arrayUtil, declare, topic) {
	/**
	 * @class
	 * @name rishson.control.Dispatcher
	 * @description This class is the conduit for all client server communication.
	 */
	return declare('rishson.control.Dispatcher', null, {

		/**
		 * @field
		 * @name rishson.control.Dispatcher.transport
		 * @type {rishson.control.Transport}
		 * @description an implementation of rishson.control.Transport
		 */
		transport: null,

		/**
		 * @field
		 * @name rishson.control.Dispatcher.socketTransport
		 * @type {rishson.control.socket.SocketTransport}
		 * @description The socket transport layer used to communicate with a socket adapter
		 */
		socketTransport: null,

		/**
		 * @field
		 * @name rishson.control.Dispatcher.grantedAuthorities
		 * @type {Array}
		 * @description an array of permission to grant to the currently logged on user. Permissions will be coerced to
		 * lower case.
		 */
		grantedAuthorities: null,

		/**
		 * @field
		 * @name rishson.control.Dispatcher.returnRequest
		 * @type {boolean}
		 * @description should the Request be returned to the callee when a Response is created
		 */
		returnRequest: false,

		/**
		 * @field
		 * @name rishson.control.Dispatcher._topicNamespace
		 * @type {string}
		 * @private
		 * @description This namespace is prepended to every topic
		 */
		_topicNamespace: Globals.TOPIC_NAMESPACE,

		/**
		 * @field
		 * @name rishson.control.Dispatcher._haveProcessedLoginResponse
		 * @type {boolean}
		 * @private
		 * @description Have we processed a LoginResponse
		 */
		_haveProcessedLoginResponse : false,

		/**
		 * @constructor
		 * @param {rishson.control.Transport} transport an implementation of rishson.control.Transport
		 */
		constructor: function (transport, socketFactory) {
			var criteria = [
					{paramName: 'transport', paramType: 'object'}
				],
				validator = new ObjectValidator(criteria),
				params = {'transport': transport};

			//collect up the params and validate
			if (validator.validate(params)) {
				this.transport = transport;

				if (socketFactory) {
					this.socketTransport = new SocketTransport(socketFactory);
				}

				//decorate the transport with the response and error handling functions in this class (need hitching)
				this.transport.addResponseFunctions(lang.hitch(this, this.handleResponse),
					lang.hitch(this, this.handleError));

				//listen out for other classes wanting to send requests to the server
				topic.subscribe(Globals.SEND_REQUEST, lang.hitch(this, "send"));
			} else {
				validator.logErrorToConsole(params, 'Invalid params passed to the Dispatcher.');
				throw ('Invalid params passed to the Controller.');
			}
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.send
		 * @param {rishson.control.Request} request to send to the server
		 * @param {string} appId the id of an application making the request - optional
		 * @description Issues the provided <code>rishson.control.Request</code> in an asynchronous manner
		 * This function delegates the actual sending of the Request to the injected Transport implementation.
		 * rishson.control.Dispatcher.handleRequest will be called for valid responses.
		 * rishson.control.Dispatcher.handleError will be called if an error occurred during the send.
		 */
		send: function (request, appId) {
			this.transport.send(request, appId);
			//auditing, analytics etc can be enabled here
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.socketRegisterInterest
		 * @param {rishson.control.socket.SocketRequest} request
		 * @param {string} appId
		 * @description Informs the server that the application is interested in an event.
		 */
		socketRegisterInterest: function (request, appId) {
			this.socketTransport.registerInterest(appId, request);
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.socketDeregisterInterest
		 * @param {rishson.control.socket.SocketRequest} request
		 * @param {string} appId
		 * @description Informs the server that the application is no longer interested in an event.
		 */
		socketDeregisterInterest: function (request, appId) {
			this.socketTransport.deregisterInterest(appId, request);
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.socketRegisterTopics
		 * @param {Array} topics
		 * @param {string} appId
		 * @description Binds the applications socket to listen to the passed events.
		 */
		socketRegisterTopics: function (topics, appId) {
			this.socketTransport.registerTopics(appId, topics);
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.handleResponse
		 * @param {Object} request an object that is the original request to the server
		 * @param {rishson.control.Response} response an object that is the server response
		 * @description Handles a valid response from a transport.
		 */
		handleResponse: function (request, response) {
			var scopedCallback,
				topicData,
				apps;

			if (!this._haveProcessedLoginResponse && this._isSuccessfulLoginResponse(response)) {
				response.payload = this._processSuccessfulLoginResponse(response);
				apps = this._setupApplicationSubscriptions(response.payload.apps);
				this.transport.bindApplicationUrls(apps);
				this._haveProcessedLoginResponse = true;	//we only need to do this once
			}

			//if the request has a topic specified then publish the response to the topic
			if (request.topic) {
				topicData = [request.topic, response];
				//return the original request along with the response if required
				if (this.returnRequest) {
					topicData.push(request);
				}
				//dojo/topic's publish doesn't take an array, so use apply to pass args
				topic.publish.apply(this, topicData);
			} else {
				//call the request's provided callback with the response - but hitch it's scope first if needs be
				if (request.callbackScope) {
					scopedCallback = lang.hitch(request.callbackScope, request.callback);
				} else {
					scopedCallback = request.callback;  //no scope specified so assume the callback is already scoped
				}

				//return the original request along with the response if required
				if (this.returnRequest) {
					scopedCallback(response, request);
				} else {
					scopedCallback(response);
				}
			}
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.handleError
		 * @param {Object} request an object that is the original request to the server
		 * @param {Object} err an object that is the server error response
		 * @description Handles an unexpected (runtime) error response from a transport.
		 */
		handleError: function (request, err) {
			//our generic error handling code goes here
			//if required, dump analytics to server
			//send error to console - might need to remove sensitive data
			throw "Error occured during server call: " + err;
			//raise error as event
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.hasGrantedAuthority
		 * @description Checks to see if a user has a granted authority
		 */
		hasGrantedAuthority: function (authority) {
			return arrayUtil.indexOf(this.grantedAuthorities, authority.toLowerCase()) >= 0;
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher._isSuccessfulLoginResponse
		 * @param {rishson.control.Response} response a server response
		 * @description Checks to see if a response is a login response
		 * @private
		 */
		_isSuccessfulLoginResponse : function (response) {
			// TODO: not sure if this should look for payload in this way. It is pretty horrific.
			return !response.isUnauthorised
				&& response.payload
				&& response.payload.apps
				&& response.payload.grantedAuthorities
				&& response.payload.username;
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher._processSuccessfulLoginResponse
		 * @param {rishson.control.Response} response a server response
		 * @description Checks to see if a response is a login response
		 * @private
		 */
		_processSuccessfulLoginResponse : function (response) {
			var loginResponse,
				mixinObj = {},
				index;

			try {
				loginResponse = new LoginResponse(response);
				mixinObj = {
					grantedAuthorities: loginResponse.grantedAuthorities,
					returnRequest: loginResponse.returnRequest
				};
				lang.mixin(this, mixinObj);

				//convert authorities to lower case so we can do case-insensitive search for authorities
				arrayUtil.forEach(this.grantedAuthorities, function (authority) {
					if (lang.isString(authority)) {
						authority = authority.toLowerCase();
					} else {
						//remove invalid permissions that are not strings
						console.error("Invalid authority passed to Dispatcher: " + authority);
						index = arrayUtil.indexOf(authority);
						this.grantedAuthorities.splice(index, 1);
					}
				}, this);
				return loginResponse;
			} catch (e) {
				console.error('Invalid creation of LoginResponse', e);
				return response;	//just return the original response if creation of LoginResponse failed
			}
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher._setupApplicationSubscriptions
		 * @description Subscribe to request/send events for child applications from loginResponse.
		 * @param {object} apps a list of application objects
		 * @return {object} the list of apps with all but the name and baseUrl removed
		 * @private
		 */
		_setupApplicationSubscriptions: function (apps) {
			var i = 0,
				l = apps.length,
				app,
				appId,
				appURL,
				appObj = {};

			for  (i; i < l; i += 1) {
				app = apps[i];
				appId = app.id.toLowerCase();

				// Create a tag value entry on the appObj where the key is the application id
				// and the value the baseUrl
				appObj[appId] = app.baseUrl;
				appURL = '/' + appId;

				topic.subscribe(appURL + "/request/send", lang.hitch(this, function _send (appId, request) {
					this.send(request, appId);
				}, appId));

				if (app.websocket) {
					this._setupSocketSubscriptionsForApp(appId, appURL, app.baseUrl);
				}
			}
			return appObj;
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher._setupSocketSubscriptionsForApp
		 * @description Sets up application wide listeners for application socket requests.
		 * @param {string} appId Application id
		 * @param {string} appURL A namespace formatted application id
		 * @param {string} baseUrl
		 * @private
		 */
		_setupSocketSubscriptionsForApp: function (appId, appURL, baseUrl) {
			this.socketTransport.createSocketForApp(appId, baseUrl);

			topic.subscribe(appURL + Globals.SOCKET_REQUEST, lang.hitch(this, function (appId, request, data) {
				switch (request) {
				case Globals.SOCKET_EVENTS.REGISTER_INTEREST:
					this.socketRegisterInterest(data, appId);
					break;
				case Globals.SOCKET_EVENTS.DEREGISTER_INTEREST:
					this.socketDeregisterInterest(data, appId);
					break;
				case Globals.SOCKET_EVENTS.REGISTER_TOPICS:
					this.socketRegisterTopics(data, appId);
					break;
				}
			}, appId));
		}
	});
});