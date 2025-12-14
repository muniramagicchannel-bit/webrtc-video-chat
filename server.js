const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let users = {};
let queue = [];

wss.on('connection', ws => {
  ws.on('message', msg => {
    const d = JSON.parse(msg);

    if (d.type === 'register') users[d.id] = ws;

    if (d.type === 'random') {
      if (queue.length) {
        const p = queue.shift();
        users[p]?.send(JSON.stringify({ type: 'random-found', id: d.id }));
        ws.send(JSON.stringify({ type: 'random-found', id: p }));
      } else queue.push(d.id);
    }

    if (users[d.to]) users[d.to].send(JSON.stringify(d));
  });

  ws.on('close', () => {
    for (let i in users) if (users[i] === ws) delete users[i];
    queue = queue.filter(i => users[i]);
  });
});

console.log('Signaling server running on ws://localhost:3000');
