//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestMockTransport");

dojo.require('test.Scaffold');
dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');
dojo.require('rishson.enterprise.control.RestRequest');

doh.register("MockTransport tests", [
    {
        name: "Send tests",
        setUp: function(){
            var scaffold = new test.Scaffold();
            controller = scaffold.createController();
        },
        runTest: function(){
            try{
                myCallback = function(response) {
                  console.group("Data received in callback");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload.testData === 'someValue');
                };

                //example of a valid WebService call to call a method specifically designed to test a Controller
                var someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
                    method : 'ControllerTestMethod',
                    params : [{testData : 'someValue', status : 200}],
                    callback : myCallback,
                    callbackScope : this});

                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue('false', 'Unexpected error occurred sending ServiceRequest'); //we should not be here
            }

            var invalidServiceCall = {};
            var invalidConstruction = false;
            try {
                controller.send(invalidServiceCall);
            }
            catch(e)
            {
                invalidConstruction = true;
            }
            doh.assertTrue(invalidConstruction, 'Unexpected constructor acceptance of invalid params');

			try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService/testEntity',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 200}],
                    topic : '/test/controller/get/200'});

                dojo.subscribe('/test/controller/get/200', function (response){
                    console.group("Data received in topic");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload);
					doh.assertTrue(response.isOk);
					doh.assertFalse(response.isInvalid);
					doh.assertFalse(response.isUnauthorised);
					doh.assertFalse(response.isConflicted);
                });
                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error testing REST in mocks'); //we should not be here
            }

        },
        tearDown: function(){
        }

    }

]);

//example of a REST call
//var someRestCall = new rishson.enterprise.control.RestRequest({verb : 'post',
//    data : {username : 'andy'},
//    callback : myCallback,
//    scope : this});

//controller.send(someRestCall);
