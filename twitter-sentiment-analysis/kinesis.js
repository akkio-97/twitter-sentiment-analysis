var Twitter = require('twitter');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

var kinesis = new AWS.Kinesis();

var client = new Twitter({
    consumer_key: "your consumer_key",
    consumer_secret: "your consumer_secret key",
    access_token_key: "your access_token_key",
    access_token_secret: "your access_token_secret"
});

var stream = client.stream('statuses/filter', {
    track: 'dog',
    language: 'en'
});

stream.on('data', function (event) {
    if (event.text) {
        var record = JSON.stringify({
            id: event.id,
            timestamp: event['created_at'],
            tweet: event.text.replace(/["'}{|]/g, '') //either strip out problem characters or base64 encode for safety 
        }) + '|'; // record delimiter

        kinesis.putRecord({
            Data: record,
            StreamName: 'twitterstream',
            PartitionKey: 'key'
        }, function (err, data) {
            if (err) {
                console.error(err);
            }
            console.log('sending: ', event.text);
        });
    }
});

stream.on('error', function (error) {
    throw error;
});