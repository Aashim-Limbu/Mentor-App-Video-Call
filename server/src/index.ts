import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let senderSocket: null | WebSocket = null;
let recieverSocket: null | WebSocket = null;

// signaling server
wss.on("connection", function (ws) {
  ws.on("error", console.error);
  ws.on("message", function (data: any) {
    const message = JSON.parse(data);
    if (message.type == "sender") {
      senderSocket = ws;
    } else if (message.type == "reciever") {
      recieverSocket = ws;
    } else if (message.type == "createOffer") {
      if (ws !== senderSocket) {
        return;
      }
      recieverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    } else if (message.type == "createAnswer") {
      if (ws !== recieverSocket) {
        return;
      }
      senderSocket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
    } else if (message.type == "iceCandidate") {
      //sender socket forwards the ice candidate then send it to the reciever socket
      if (ws == senderSocket) {
        recieverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      } else if (ws == recieverSocket) {
        // if reciever socket send the ice candidate send it to senderSocket
        senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
    }
    console.log(message);
  });
  ws.send("something");
});
