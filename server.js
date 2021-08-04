const express = require('express');
const ws = require('ws');
const axios = require('axios');
const { response } = require('express');

const app = express();


// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', symbol => {
      const symb = symbol.toString();
            callVendor(symb).then(
            (response) => {
            socket.send(JSON.stringify(response));
            }
        )
    });
});

// `server` is a vanilla Node.js HTTP server, so use
const port = process.env.PORT || 3030;
const server = app.listen(port);
console.log('lictening on 3030')
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

async function callVendor(symbol) {
    console.log('symbol', symbol)
    const endpoint = 'https://api.dstoq.com/core/assets/assets/' + symbol + '/?trading_pair=USDC&time_span=LAST_HOUR'
    try {
        axios.get(endpoint)
        .then((response) => {
            console.log('agg', response.data.aggregations);
            return response.aggregations;
        })
    } catch (error) {
        return error;
    }
}