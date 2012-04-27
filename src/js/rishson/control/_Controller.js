define([
    "rishson/control/_PubSubMixin", //createTopicNamespace, _capitaliseTopicName
    "dojo/_base/declare", // declare
    "dojo/_base/array", // forEach
    "dojo/_base/lang", // hitch
    "dojo/topic" // publish/subscribe
], function (_PubSubMixin, declare, arrayUtil, lang, topic) {
    /**
     * @class
     * @name rishson.control._Controller
     * @description This is the base class for Controller classes/widgets<p>
     * Controllers are classes that wire together the view (widgets) and the model.<p>
     * Application widgets are basically 'Controllers' in an MVC paradigm. Application widgets typically provide layout<p>
     * container functionality to child widgets and act as the controller for the enclosed child widgets.<p>
     * An Application widget knows about all views (child widgets) and models (stores) for the 'Application'.<p>
     * This class specifically adds the autowiring of topics between child widgets and the Application widget.<p>
     *<p>
     * Usage:<p>
     *<p>
     * myChildWidget.pubList({SOME_EVENT :'some/topic'});<p>
     * ...<p>
     * myApplicationWidget.injectWidget(myChildWidget);<p>
     * or
     * myController.adopt(myChildWidget, {}, someDomNode);<p>
     *<p>
     * At this point, all the topic in mychildWidget.pubList are wired to event handlers in myApplicationWidget.
     */
    return declare("rishson.control._Controller", [_PubSubMixin], {

		/**
		 * @constructor
		 */
		constructor : function () {
			this._topicNamespace = this.createTopicNamespace(this.declaredClass);
			this.pubList = this.pubList || {};
			this.subList = this.subList || {};
		},

        /**
         * @function
         * @name rishson.control._Controller.injectWidget
         * @param {rishson.widget._Widget} widget a widget to examine for topics
         * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
         * This function should be called for declarativly created widgets.
         */
        injectWidget : function (widget) {
            this._autowirePubs(widget);
        },
    
        /**
         * @function
         * @name rishson.control._Controller.adopt
         * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
         * This function should be called for programatically created widgets.
         */
        adopt : function (/*Function*/Cls, /*Object*/props, /*DomNode*/node) {
            var widget = new Cls(props, node);
            this._autowirePubs(widget);
            return widget;
        },

    
        /**
         * @function
         * @name rishson.control._Controller._autowirePubs
         * @private
         * @param {rishson.widget._Widget} widget a widget that contains a pubList of topics that it can publish.
         * @description autowire the published topics from the widget to event handlers in the Application widget.
         */
        _autowirePubs : function (widget) {
			var topicObj, topicName, handlerFuncName, handlerFunc;

            //iterate over each published topic of the passed in widget - the application widget need to subscribe to these
            for(topicObj in widget.pubList) {
                if(widget.pubList.hasOwnProperty(topicObj)) {
                    topicName = widget.pubList[topicObj];
                    //capitalise the topic section names and remove slashes
                    handlerFuncName = this.capitaliseTopicName(topicName);
                    handlerFuncName = '_handle' + handlerFuncName.replace(/[//]/g, '');

                    //the implementing class needs to have _handle[topicName] functions by convention
                    handlerFunc = this[handlerFuncName];
                    if(handlerFunc) {
                        topic.subscribe(topicName, lang.hitch(this, handlerFunc));
                    }
                    else {
                        console.error('Autowire failure for topic: ' + topicName + '. No handler: ' + handlerFuncName);
                    }    
                }	
            }
        }
    
    });
});