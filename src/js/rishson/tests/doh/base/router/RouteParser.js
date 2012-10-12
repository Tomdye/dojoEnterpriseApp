define([
	"doh",
	"dojo/_base/lang",
	"rishson/base/router/RouteParser",
	"rishson/base/router/Route",
	"dojo/json"
], function (doh, lang, RouteParser, Route, json) {

	var makeFakeURLModifier = function (getValue) {
		return {
			set: function () {},
			get: function () { return getValue || ""; }
		};
	};

	doh.register("Hash Parser tests", [
		{
			name: "Instantiates with a parser",
			runTest: function () {
				var parser = new RouteParser(makeFakeURLModifier());

				doh.assertTrue(parser);
			}
		},
		{
			name: "Throws exception when no parser given",
			runTest: function () {
				var threw = false;

				try {
					var parser = new RouteParser();
				} catch (e) {
					threw = true;
				}

				doh.assertTrue(threw);
			}
		},
		{
			name: "hasChild returns true when route has a child",
			runTest: function () {
				var route = new Route({
					routeName: "FirstChild"
				});

				var parser = new RouteParser(makeFakeURLModifier("FirstChild/SecondChild"));

				doh.assertTrue(parser.hasChild(route));
			}
		},
		{
			name: "hasChild returns false when route does not have a child",
			runTest: function () {
				var route = new Route({
					routeName: "SecondChild"
				});

				var parser = new RouteParser(makeFakeURLModifier("FirstChild/SecondChild"));

				doh.assertFalse(parser.hasChild(route));
			}
		},
		{
			name: "hasChild returns false when route is not in URL at all",
			runTest: function () {
				var route = new Route({
					routeName: "ThirdChild"
				});

				var parser = new RouteParser(makeFakeURLModifier("FirstChild/SecondChild"));

				doh.assertFalse(parser.hasChild(route));
			}
		},
		{
			name: "getChildName returns the name of the child when it exists",
			runTest: function () {
				var route = new Route({
					routeName: "FirstChild"
				});

				var parser = new RouteParser(makeFakeURLModifier("FirstChild/SecondChild"));

				doh.assertEqual("SecondChild", parser.getChildName(route));
			}
		},
		{
			name: "getChildName returns null when a child does not exist",
			runTest: function () {
				var route = new Route({
					routeName: "SecondChild"
				});

				var parser = new RouteParser(makeFakeURLModifier("FirstChild/SecondChild"));

				doh.assertEqual(null, parser.getChildName(route));
			}
		},
		{
			name: "getChildName strips any parameters for a valid child",
			runTest: function () {
				var route = new Route({
					routeName: "FirstChild"
				});

				var parser = new RouteParser(makeFakeURLModifier("FirstChild/SecondChild={params}"));

				doh.assertEqual("SecondChild", parser.getChildName(route));
			}
		},
		{
			name: "resolveRoute resolves a single item route",
			runTest: function () {
				var route = new Route({
						routeName: "FirstChild"
					}),
					parser = new RouteParser(makeFakeURLModifier());

				doh.assertEqual("FirstChild/", parser.resolveRoute(route));
			}
		},
		{
			name: "resolveRoute resolves a multiple item route",
			runTest: function () {
				var route = new Route({
						routeName: "FirstChild",
						parentRoute: new Route({
							routeName: "SecondChild",
							parentRoute: new Route({
								routeName: "ThirdChild"
							})
						})
					}),
					parser = new RouteParser(makeFakeURLModifier());

				doh.assertEqual("ThirdChild/SecondChild/FirstChild/", parser.resolveRoute(route));
			}
		},
		{
			name: "getParameters returns null for a route with no parameters",
			runTest: function () {
				var route = new Route({
						routeName: "FirstChild"
					}),
					parser = new RouteParser(makeFakeURLModifier("FirstChild"));

				doh.assertEqual(null, parser.getParameters(route));
			}
		},
		{
			name: "getChildParameters returns deserialized parameters for a route with parameters",
			runTest: function () {
				var route = new Route({
						routeName: 'FirstChild'
					}),
					parser = new RouteParser(makeFakeURLModifier('FirstChild={"id":"test"}'));

				doh.assertEqual({"id": "test"}, parser.getParameters(route));
			}
		},
		{
			name: "getChildParameters returns deserialized parameters for a nested route",
			runTest: function () {
				var firstChild = new Route({ routeName: "FirstChild" }),
					secondChild = new Route({ routeName: "SecondChild", parentRoute: firstChild }),
					parser = new RouteParser(makeFakeURLModifier(
						'FirstChild/SecondChild={"id":"test"}/ThirdChild'
					));

				doh.assertEqual({"id": "test"}, parser.getParameters(secondChild));
			}
		},
		{
			name: "getChildParameters returns null for invalid parameters",
			runTest: function () {
				var firstChild = new Route({ routeName: "FirstChild" }),
					secondChild = new Route({ routeName: "SecondChild", parentRoute: firstChild }),
					parser = new RouteParser(makeFakeURLModifier(
						'FirstChild/SecondChild=""&id"":#"t3est"}/'
					));

				doh.assertEqual(null, parser.getParameters(secondChild));
			}
		},
		{
			name: "getFirstChild returns first child for a nested URL and strips parameters",
			runTest: function () {
				var parser = new RouteParser(makeFakeURLModifier(
						"FirstChild={}/SecondChild/ThirdChild/"
					));

				doh.assertEqual("FirstChild", parser.getFirstChild());
			}
		}
	]);
});