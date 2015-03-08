var mqtt = require('mqtt');

var client = mqtt.connect({
  port: process.env['PORT'] || 1883,
  host: 'localhost',
  clean: true,
  keepalive: 0
});

var sent = 0;
var interval = 5000;

function count() {
  console.log('sent/s', sent / interval * 1000);
  sent = 0;
}

setInterval(count, interval);

function immediatePublish() {
  setImmediate(publish)
}

function publish() {
  sent++;
  client.publish('test', 'payload', immediatePublish);
}

client.on('connect', function(){
  console.log('connected!');
  publish();
});

client.on('error', function() {
  console.log('reconnect!');
  client.stream.end();
});
