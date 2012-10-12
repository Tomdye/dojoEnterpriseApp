define([
	"dojo/_base/lang",
	"dojo/json",
	"dojo/on",
	"dojo/_base/event",
	"dojo/_base/window",
	"rishson/Globals"
], function (lang, json, on, event, win, Globals) {
	on(win.body(), "a." + Globals.BUBBLING_CLASS + ":click", function (e) {
		event.stop(e);
	});
});