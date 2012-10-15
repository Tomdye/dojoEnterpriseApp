define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/hash"
], function (declare, lang, hash) {
	return {
		CHANGE_EVENT: "/dojo/hashchange",

		format: function (url) {
			return "#" + url;
		},

		get: function () {
			return hash();
		},

		set: function (route) {
			hash(route);
		}
	};
});