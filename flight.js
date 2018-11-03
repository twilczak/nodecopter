const arDrone = require('ar-drone');
const http = require('http');
const fs = require('fs');
const client = arDrone.createClient();
client.config('control:altitude_max', 3000);

function fly(client) {
  // client.takeoff();
  //
  // client
  //   .after(5000, function() {
  //     this.clockwise(0.5);
  //   })
  //   .after(1000, function() {
  //     this.stop();
  //     this.land();
  //   });
  //
}

function server(client, opts, onLoad) {
  let png = null;
  let pngdata = null;
  let loaded = false;

  opts = opts || {};

  const server = http.createServer(function(req, res) {
    console.log(req.url);

    if (!png) {
      png = client.getPngStream();
      png.on('error', function (err) {
          console.error('png stream ERROR: ' + err);
      });
      png.on('data', (data) => {
        if(!loaded){
          loaded = true;
          console.log('read to fly');
          onLoad();
        }
        pngdata = data;
      });
    }

    const requestUrl = req.url;

    if(requestUrl.startsWith('/image') && pngdata) {

      console.log(pngdata.length);
      res.writeHead(200, {'Content-Type': 'multipart/x-mixed-replace; boundary=--daboundary',});
      res.write('--daboundary\nContent-Type: image/png\nContent-length: ' + pngdata.length + '\n\n');
      res.write(pngdata);
      res.end();
    } else if(requestUrl === '/') {
      fs.readFile('./index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
      });
    } else {
      fs.readFile('./face-detector.js',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
      });
    }
  });

  server.listen(opts.port || 8000);
}

server(client,{ port: 8000 },() => fly(client));
