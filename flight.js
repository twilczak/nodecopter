const arDrone = require('ar-drone');
const http = require('http');
const fs = require('fs');
const client = arDrone.createClient();
client.config('control:altitude_max', 3000);

function fly(client) {
  client.stop();
  client.takeoff();
  console.log('[main] takeoff');

  setTimeout(() => {
    client.up(0.5);
    console.log('[main] up');
  }, 2000);

  setTimeout(() => {
    client.stop();

  }, 2500);

  setTimeout(() => {
    console.log('[main] main stop');
    client.stop();
    client.land();
  }, 30000);
}

function server(client, opts, onLoad) {
  let png = null;
  let pngdata = null;
  let loaded = false;

  opts = opts || {};

  const server = http.createServer(function(req, res) {

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
    } else if(requestUrl === '/face-detector.js'){
      fs.readFile('./face-detector.js',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
      });
    } else if(requestUrl === '/postActions') {
      let body = '';
      req.on('data', chunk => {body += chunk.toString(); });
      req.on('end', () => {
        handlePostActions(client, JSON.parse(body), (res));
      })
    }
  });

  server.listen(opts.port || 8000);
}

function handlePostActions(client, body, res) {
  const speed = 0.2;
  const duration = 350;
  const {actions} = body;
  console.log('[handle actions]', actions);

  if(actions.length) {

    console.log(actions);
    actions.forEach(action => {
      console.log('[handle actions] client.' + action);
      client[action].call(client, speed);
    });

    setTimeout(() => {
      console.log('[handle actions] stopping');
      client.stop();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write(actions.toString());
      res.end('ok');
    }, duration);

  } else {
    console.log('[handle actions] no actions');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('no actions');
    res.end('ok');
  }

}

server(client,{ port: 8000 },() => fly(client));
