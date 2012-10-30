define(["exports"], function (exports) {
	/**
	 * @class
	 * @name rishson.Globals
	 * @description This is a constants class from anything that the whole application needs to know about.
	 * Direct instantiation of this class is not required. In OO terms, this would be a static class. IN JavaScript, we
	 * simply create an instance of this class after the class declaration. You can also use this pattern with classes
	 * where there is no constructor; simply copy the class prototype over to the namespace in the DOM where an instance
	 * would reside. Basically, syntactic sugar: my.namespace.SomeClass = my.namespace.SomeClass.prototype;
	 */

	/**
	 * @field
	 * @name rishson.Globals.TOPIC_NAMESPACE
	 * @type {string}
	 * @description This namespace is prepended to every topic name
	 */
	exports.TOPIC_NAMESPACE = "/rishson";

	/**
	 * @field
	 * @name rishson.Globals.INTIALISED_TOPIC_NAME
	 * @type {string}
	 * @description This namespace is prepended to every topic initialisation
	 */
	exports.INTIALISED_TOPIC_NAME = "/initialised";

	/**
	 * @field
	 * @name rishson.Globals.INTIALISED_TOPIC_NAME
	 * @type {string}
	 * @description This namespace is prepended to every topic initialisation
	 */
	exports.CHILD_INTIALISED_TOPIC_NAME = "/child/initialised";

	/**
	 * @field
	 * @name rishson.Globals.SEND_REQUEST
	 * @type {string}
	 * @description This namespace is prepended to every topic name
	 */
	exports.SEND_REQUEST = exports.TOPIC_NAMESPACE + "/request/send";

	/**
	 * @field
	 * @name rishson.Globals.SOCKET_SUBSCRIBE
	 * @type {string}
	 * @description This namespace is prepended to every topic name
	 */
	exports.SOCKET_SUBSCRIBE = exports.TOPIC_NAMESPACE + "/socket/subscribe";

	/**
	 * @field
	 * @name rishson.Globals.SOCKET_UNSUBSCRIBE
	 * @type {string}
	 * @description This namespace is prepended to every topic name
	 */
	exports.SOCKET_UNSUBSCRIBE = exports.TOPIC_NAMESPACE + "/socket/unsubscribe";

	/**
	 * @field
	 * @name rishson.Globals.UPDATE_ROUTE
	 * @type {string}
	 * @description The event to subscribe to when the route needs to be updated
	 */
	exports.UPDATE_ROUTE = exports.TOPIC_NAMESPACE + "/route/update";

	/**
	 * @field
	 * @name rishson.Globals.BUBBLING_CLASS
	 * @type {string}
	 * @description A class that can be added to <a> tags to prevent event bubbling
	 */
	exports.BUBBLING_CLASS = "no-bubbling";
});
