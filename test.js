const arDrone = require('ar-drone');
const client  = arDrone.createClient();
client.config('control:altitude_max', 3000);

client.takeoff();

client.after(5000, () => {
  client.animateLeds('blinkOrange', 5, 1000);
  client.left(0.5);
  client.up(0.5);
}).after(100, () => {
  client.stop();
  client.land();
});
