const arDrone = require('ar-drone');
const http = require('http')
const client = arDrone.createClient();
client.config('control:altitude_max', 3000);

function fly(client) {
  client.takeoff();
  
  client
    .after(5000, function() {
      this.clockwise(0.5);
    })
    .after(1000, function() {
      this.stop();
      this.land();
    });
  
}

function server(client, opts, onLoad) {
  var png = null;
  var loaded = false;

  opts = opts || {};
  
  var server = http.createServer(function(req, res) {

    if (!png) {
      png = client.getPngStream();
      png.on('error', function (err) {
          console.error('png stream ERROR: ' + err);
      });
    }

    res.writeHead(200, { 'Content-Type': 'multipart/x-mixed-replace; boundary=--daboundary' });

    png.on('data', (d) => {
      if(!loaded){
        loaded = true;
        console.log('read to fly')
        onLoad();
      }
      sendPng(d)
    });

    function sendPng(buffer) {
      console.log(buffer.length);
      res.write('--daboundary\nContent-Type: image/png\nContent-length: ' + buffer.length + '\n\n');
      res.write(buffer);
    }
  });

  server.listen(opts.port || 8000);
};

server(client,{ port: 8000 },() => fly(client))