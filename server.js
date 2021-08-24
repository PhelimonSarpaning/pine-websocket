const express = require("express");
const io = require("socket.io");
const ws = require("ws");
const axios = require("axios").default;

const app = express();

// Set up a headless websocket server that prints any
// events that come in.

// `server` is a vanilla Node.js HTTP server, so use
const port = process.env.PORT || 3031;
const server = app.listen(port);
console.log("listening on ", port);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});

const clients = [];

setInterval(() => {
  clients.forEach(async (client) => {
    try {
      const res = await getStockPrice();
      //   console.log(res);
      client.send(JSON.stringify(res));
    } catch (e) {
      console.log(e);
    }

    // console.log(client);
  });
}, 5000);

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket) => {
  clients.push(socket);
  //   socket.on("message", (symbol) => {
  //     const symb = symbol.toString();
  //     callVendor(symb).then((response) => {
  //       socket.send(JSON.stringify(response));
  //     });
  //   });
});

async function getStockPrice() {
  const aapl = axios.get(
    "https://api.dstoq.com/core/assets/assets/AAPL/?trading_pair=USDC&time_span=LAST_HOUR"
  );
  const goog = axios.get(
    "https://api.dstoq.com/core/assets/assets/GOOG/?trading_pair=USDC&time_span=LAST_HOUR"
  );
  const fb = axios.get(
    "https://api.dstoq.com/core/assets/assets/FB/?trading_pair=USDC&time_span=LAST_HOUR"
  );
  const tsla = axios.get(
    "https://api.dstoq.com/core/assets/assets/TSLA/?trading_pair=USDC&time_span=LAST_HOUR"
  );
  const zm = axios.get(
    "https://api.dstoq.com/core/assets/assets/ZM/?trading_pair=USDC&time_span=LAST_HOUR"
  );

  return new Promise((resolve, reject) => {
    Promise.all([aapl, goog, fb, tsla, zm])
      .then((res) => {
        resolve({
          aapl: {
            price: parseFloat(res[0].data.aggregations[0].close).toFixed(2),
            open: parseFloat(res[0].data.aggregations[0].open).toFixed(2),
            stockName: "Apple",
          },
          goog: {
            price: parseFloat(res[1].data.aggregations[0].close).toFixed(2),
            open: parseFloat(res[1].data.aggregations[0].open).toFixed(2),
            stockName: "Google",
          },
          fb: {
            price: parseFloat(res[2].data.aggregations[0].close).toFixed(2),
            open: parseFloat(res[2].data.aggregations[0].open).toFixed(2),
            stockName: "Facebook",
          },
          tsla: {
            price: parseFloat(res[3].data.aggregations[0].close).toFixed(2),
            open: parseFloat(res[3].data.aggregations[0].open).toFixed(2),
            stockName: "Tesla",
          },
          zm: {
            price: parseFloat(res[4].data.aggregations[0].close).toFixed(2),
            open: parseFloat(res[4].data.aggregations[0].open).toFixed(2),
            stockName: "Zoom",
          },
        });
      })
      .catch((err) => console.log(err));
  });
}

async function callVendor(symbol) {
  const endpoint =
    "https://api.dstoq.com/core/assets/assets/" +
    symbol +
    "/?trading_pair=USDC&time_span=LAST_HOUR";
  try {
    axios.get(endpoint).then((response) => {
      //   console.log("agg", response.data.aggregations);
      return response.aggregations;
    });
  } catch (error) {
    return error;
  }
}
