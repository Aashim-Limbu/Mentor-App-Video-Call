import { WebSocket, WebSocketServer } from "ws";

interface User {
  id: string;
  socket: WebSocket;
  roomId: string;
  username?: string;
}
interface Room {
  id: string;
  users: Map<string, User>;
}

class VideoCallServer {
  private wss: WebSocketServer;
  // sender users [roomid: string] [Room]
  private rooms: Map<string, Room> = new Map();
  private users: Map<WebSocket, User> = new Map();
  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });
    console.log("Video Calling server started at port: ", port);
  }
  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New connection established !");
      ws.on("error", (error) => {
        console.error("Websocket error: ", error);
      });
      ws.on("message", (data: any) => {
        try {
          const message = JSON.parse(data.toString());
        } catch (error) {}
      });
    });
  }
  // message.type can be offer or answer thingy.
  private handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case "offer":
        break;
      case "answer":
        break;
      case "ice-candidate":
        break;
      case "get-users":
        break;
      case "get-media-state":
        break;
      case "join-room":
        break;
      case "leave-room":
        break;
      default:
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Unknown message type: ${message.type}`,
          })
        );
        break;
    }
  }
  // 1. handle join-request.
  private handleJoinRoom(ws: WebSocket, message: any) {
    const { roomId, username, userId } = message;
    if (!roomId || !userId) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Room ID and User ID are required",
        })
      );
    }
    // create room if it doesn't exists.
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { id: roomId, users: new Map() });
    }
    const room = this.rooms.get(roomId);
    // check if user is already in the room.
    if (this.users.get(ws)) {
      const existingUser = this.users.get(ws);
    }
  }

  // 2. Handling offer.
  private handleOffer(ws: WebSocket, message: any) {
    const { targetUserId, offer } = message;
    const sender = this.users.get(ws);
    // This must be the sender and should've targetUserId
    if (!sender || !targetUserId) {
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid offer request" })
      );
      return;
    }
    const room = this.rooms.get(sender.roomId);
    const targetUser = room?.users.get(targetUserId);
    if (targetUser) {
      targetUser.socket.send(
        JSON.stringify({
          type: "offer",
          fromUserId: sender.id,
          offer: offer,
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Target user not found.",
        })
      );
    }
  }

  private removeUserFromRoom(user: User) {
    const room = this.rooms.get(user.roomId);
    if (room) {
      room.users.delete(user.id);
      this.broadcastToRoom(
        room.id,
        {
          type: "user-left",
          userId: user.id,
          username: user.username,
          userCount: room.users.size,
        },
        user.id
      );
      // if there is no users left delete the rooms
      if (room.users.size === 0) {
        this.rooms.delete(user.roomId);
        console.log(`Room ${user.roomId} deleted`);
      }
    }
    this.users.delete(user.socket);
  }
  private broadcastToRoom(
    roomId: string,
    message: any,
    excludeUserId?: string
  ) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.forEach((user) => {
        if (
          user.id !== excludeUserId &&
          user.socket.readyState === WebSocket.OPEN
        ) {
          user.socket.send(JSON.stringify(message));
        }
      });
    }
  }
}
