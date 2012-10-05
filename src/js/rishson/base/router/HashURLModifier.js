define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/hash"
], function (declare, lang, hash) {
	return declare("rishson.base.router.HashURLModifier", null, {
		get: function () {
			return hash();
		},

		set: function (route) {
			hash(route);
		}
	});
});