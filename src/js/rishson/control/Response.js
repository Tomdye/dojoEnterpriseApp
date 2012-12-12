define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang" // mixin
], function (declare, lang) {
	/**
	 * @class
	 * @name rishson.control.Response
	 * @description This class is used to wrap any server response.
	 */
	return declare('rishson.control.Response', null, {
		/**
		 * @field
		 * @name rishson.control.Request.isOk
		 * @type {boolean}
		 * @description is the response OK. This equates to HTTP status code 200.
		 */
		isOk: false,

		/**
		 * @field
		 * @name rishson.control.Request.isConflicted
		 * @type {boolean}
		 * @description is the response indicating a conflicted server state. This equates to HTTP status code 409.
		 */
		isConflicted: false,

		/**
		 * @field
		 * @name rishson.control.Request.isInvalid
		 * @type {boolean}
		 * @description is the response indicating that the request was invalid. This equates to HTTP status code 400.
		 * This is a bit of a judgement call. Technically this should probably be mapped to 403, section 10.4.4 of RFC 2119
		 * states that: "403 Forbidden The server understood the request, but is refusing to fulfill it. Authorization will
		 * not help and the request SHOULD NOT be repeated. If the request method was not HEAD and the server wishes to make
		 * public why the request has not been fulfilled, it SHOULD describe the reason for the refusal in the entity.
		 * If the server does not wish to make this    information available to the client, the status code 404 (Not Found)
		 * can be used instead."
		 * However, convention (O'Reiley RESTful Web Services) tends to map invalid to 400 (BAD REQUEST) rather than 403.
		 * We could debate this ALL day long, but we should probably go write some code instead.
		 */
		isInvalid: false,

		/**
		 * @field
		 * @name rishson.control.Request.isUnauthenticated
		 * @type {boolean}
		 * @description is the response indicating that the request was from a source that could not
		 * be authenticated. This equates to HTTP status code 401 (UNAUTHORIZED).
		 */
		isUnauthenticated: false,

		/**
		 * @field
		 * @name rishson.control.Request.isUnauthorised
		 * @type {boolean}
		 * @description is the response indicating that the request was not authorised.
		 * This equates to HTTP status code 403 (FORBIDDEN).
		 */
		isUnauthorised: false,

		/**
		 * @field
		 * @name rishson.control.Request.payload
		 * @type {object}
		 * @description the contents of the server response.
		 */
		payload: null,

		/**
		 * @field
		 * @name rishson.control.Response.mappedStatusCodes
		 * @static
		 * @type {Array.<number>}
		 * @description The status codes that are handled in a rishson.control.Response.
		 */
		mappedStatusCodes: [200, 400, 401, 403, 409],

		/**
		 * @constructor
		 * @param {Object} response the server response
		 * @param {boolean} wasRestRequest was the server request a REST request
		 * @param {Object} ioArgs the HTTP response header
		 */
		constructor: function (response, wasRestRequest, ioArgs) {
			//@todo remove {}&& prefix if added - should we be allowing comment-filtered anymore or is it an antipattern?
			this._processHttpStatusCodes(response, ioArgs);

			//service responses should not have a blank payload
			if (!wasRestRequest) {
				if (!this.payload) {
					console.error('Invalid server response. No payload.');
					throw ('Invalid server response. No payload.');
				}
			}
		},

		/**
		 * @function
		 * @name rishson.control.Response._processHttpStatusCodes
		 * @param {rishson.control.Response} response the response to process
		 * @param {Object} ioArgs the ioArgs to check
		 * @private
		 * @description convert HTTP status codes into handy response properties and remove payload wrapper if present
		 */
		_processHttpStatusCodes: function (response, ioArgs) {
			var status = ioArgs.xhr.status;
			switch (status) {
			case 200:
				this.isOk = true;
				break;
			case 400:
				this.isInvalid = true;
				break;
			case 401:
				this.isUnauthenticated = true;
				break;
			case 403:
				this.isUnauthorised = true;
				break;
			case 409:
				this.isConflicted = true;
				break;
			default:
				throw ('Unknown status code passed to Response constructor: ' + ioArgs.xhr.status);
			}

			//If the response just has data in its body, then make it a payload. If a payload is specified in the
			//response already then just add to this class.
			if (response) {
				if (this.isOk) {
					this.payload = response.payload || response;
				} else {
					/*
					 Non 200 responses do not contain a payload so get response from ioArgs.
					 This will overwrite an existing payload, however ioArgs
					 should be the expected response from the server.
					 */
					this.payload = ioArgs.xhr.response || null;
				}
			}
		}
	});
});