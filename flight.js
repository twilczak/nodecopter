const arDrone = require('ar-drone');
const client = arDrone.createClient();
const dronePngStream = require('ar-drone-png-stream')(client, { port: 8000 });
client.config('control:altitude_max', 3000);

client.takeoff();

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(1000, function() {
    this.stop();
    this.land();
  });