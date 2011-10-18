# DojoEnterpriseApp
===================

DojoEnterpriseApp is an abstracted application framework for large web applications that use the [Dojo toolkit] (www.dojotoolkit.org).

The directory structure and build scripts are taken from the excellent dojo-boilerplate by [Rebecca Murphey] (www.github.com/rmurphey).

The main features are:
----------------------

### Abstracted control layer with:
- abstracted communications protocols so that 'real' servers can be mocked during unit tests.
- abstracted server calls to introduce clean separation of concerns so that code is not littered with Urls and thus easier to refactor.
- provides a central location to perform work on all server calls (such as applying security policies, auditing, url resolution etc).

### Common set of application widgets:
- _Widget base class that provides life-cycle management based on Phil Higgins's [solution](http://higginsforpresident.net/2010/01/widgets-within-widgets) to memory leaks with custom dojo widgets that
  programatically create widgets.
- a full-page container widget with plugins for common 'enterprise' features such as session management.



### Control layer
 -------------

 You can make a call to the server without having to directly use the lower level XHR code. Since the actual mechanism
 for getting to the server adn parsing the response are abstracted, you can have a clean separation of concerns between the
 widgets and the control layer. The control layer knows nothing of the mechanics of performing a request; this is
 delegated to a Transport implementation that is injected into the control layer on construction.

 e.g.

```javascript
//example of calling a WebService on the server
 var someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
    method : 'TestMethod',
    params : [{exampleParamsName : 'exampleParamValue'}],
    callback : myCallback,
    scope : this});

 controller.send(someServiceCall);
```
 Because of this abstraction, we can plug different Transport implementations into our control layer.
 Provided out of the box are XhrTransport (for performing Xhr post calls) and MockTransport (for use in a headless
 unit test configuration with no need for a running web server).

 Web Service requests and Rest requests are currently supported.

 Although the above example uses scoped callbacks as the mechanism for returning a server response to a callee,
 you can also provide a topic name instead and the control layer will publish the response to this topic.



### AppContainer widget
 -------------------

 This widget is a placeholder for widgets that do stuff. Essentially, this widget is the full-page app chrome that
 defines a header, footer and center region (where your application goes). This widget also serves as an example
 of using pub/sub with widgets for all communication. When this widget wants to send a request to the server, it
 publishes its request on a topic. The control layer subscribes to this topic, performs the server call, and then
 publishes the response on a different topic.
 Widgets in this framework are not aware that a control layer exists.