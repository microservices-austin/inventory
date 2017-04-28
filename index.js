var autobahn = require('autobahn');
const pg = require('pg');
const connectionString = 'postgres://localhost:5432/inventory';
const client = new pg.Client(connectionString);


var connection = new autobahn.Connection({
   url: 'ws://127.0.0.1:8080/ws',
   realm: 'realm1'}
);

var commands = [
  "transferInventory",
  "adjustInventory",
  "pickInventory"
];
var events = [
  "inventoryTransferred",
  "inventoryPicked",
  "inventoryAdjusted",
  "inventoryReceived",
  "inventoryAdjustFailed",
  "inventoryReceiveFailed",
  "inventoryPickFailed",
  "inventoryTransferFailed"
];

connection.onopen = function (session) {

   function handleTransferInventory(message) {
     console.log("transferring inventory start");
     session.publish('inventory', ['inventoryTransferred']);
   }

   function handleAdjustInventory(message) {
     console.log("adjusting inventory start");
     session.publish('inventory', ['inventoryAdjusted']);
   }

   function handlePickInventory(message) {
     console.log("picking inventory start");
     session.publish('inventory', ['inventoryPicked']);
   }

   function persistEvent(eventName, message) {
     console.log("persisting event");
     
     pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
	done();
	console.log(err);
	return;
      }

      // SQL Query > Insert Data
      client.query('INSERT INTO event_store(event_name, event_body) values($1, $2)',
      [eventName, message]);
     });
   }

   // SUBSCRIBE to a topic and receive events
   function callback(args, kwargs) {
      try {
	var eventName = Object.keys(kwargs)[0];
	console.log("Received event: " + eventName);
	persistEvent(eventName, kwargs[eventName]);
	switch (eventName) {
	  case "transferInventory":
	    handleTransferInventory(kwargs[eventName]);
	    break;
	  case "adjustInventory":
	    handleAdjustInventory(kwargs[eventName]);
	    break;
	  case "pickInventory":
	    handlePickInventory(kwargs[eventName]);
	    break;
	}
     } catch(exception) {
	console.log(exception);
     }
   }

   session.subscribe('inventory', callback).then(
      function (sub) {
         console.log("subscribed to topic 'inventory'");
      },
      function (err) {
         console.log("failed to subscribed: " + err);
      }
   );

};

connection.open();
