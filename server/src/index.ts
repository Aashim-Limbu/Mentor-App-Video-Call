import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

// signaling server
wss.on("connection", function (ws) {
  ws.on("error", console.error);
  ws.on("message", function (data: any) {
    const message = JSON.parse(data);
    if (message.type == "sender") {
      console.log("sender initialized");
      senderSocket = ws;
    } else if (message.type == "receiver") {
      console.log("receiver initialized");
      receiverSocket = ws;
    } else if (message.type == "createOffer") {
      if (ws !== senderSocket) {
        return;
      }
      console.log("Offer recieved");
      receiverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    } else if (message.type == "createAnswer") {
      if (ws !== receiverSocket) {
        return;
      }
      console.log("Answer Received");
      senderSocket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
    } else if (message.type == "iceCandidate") {
      //sender socket forwards the ice candidate then send it to the receiver socket
      if (ws == senderSocket) {
        receiverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      } else if (ws == receiverSocket) {
        // if receiver socket send the ice candidate send it to senderSocket
        senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
    }
  });
  ws.send("something");
});
