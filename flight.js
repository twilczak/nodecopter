const arDrone = require('ar-drone');
const client = arDrone.createClient();
const PaVEParser = require('./node_modules/ar-drone/lib/video/PaVEParser');
const output = require('fs').createWriteStream('./vid.h264');

client.config('control:altitude_max', 3000);

const video = client.getVideoStream();
// video.on('data', console.log);
video.on('error', console.log);

const parser = new PaVEParser();

parser
  .on('data', function(data) {
    console.log(data);
    output.write(data.payload);
  })
  .on('end', function() {
    output.end();
  });

video.pipe(parser);

client.takeoff();

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(1000, function() {
    this.stop();
    this.land();
  });