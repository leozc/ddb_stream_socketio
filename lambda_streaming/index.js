'use strict';
console.log('Loading function');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
		// map to http://IP:port/channel/public
		var host="http://47.88.79.24:3000/public"; //get default for now
    console.log(event);
		var socket = require('socket.io-client')(host);
    event.Records.forEach((record) => {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);

				socket.emit("signal", JSON.stringify(record));
    });

    callback(null, `Successfully processed ${event.Records.length} records.`);
};
