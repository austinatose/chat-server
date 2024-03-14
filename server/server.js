import { Server } from "socket.io";

let rooms = [];

const io = new Server(8001, {
  cors: {
    origin: "*",
  },
});

const clients = new Set();

function Client(socket) {
  this.socket = socket;
  this.room = null;
  this.name = "Anonymous";
}

class Room {
  constructor(id) {
    this.clients = [];
    this.messages = [];
    this.id = id;
  }

  addClient(client) {
    if (client.room) throw Error("Client already in a room");
    this.clients.push(client);
    client.room = this;
  }

  removeClient(client) {
    if (!this.clients.includes(client)) throw Error("Client not in room");
    this.clients = this.clients.filter((c) => c !== client);
    client.room = null;
  }
}

console.log("Server started");

io.on("connection", socket => {
  console.log("Client connected");
  let client = new Client(socket);
  clients.add(client);
  socket.emit("connected", client.id);

  socket.on("setName", (name) => {
    console.log("setName received", name);
    client.name = name;
  });

  socket.on("sendMessage", (message) => {
    console.log("sendMessage received", message);
    if (!client.room) return;
    client.room.messages.push([client, message]);
    console.log(client.room)
    for (let clientalt of client.room.clients) {
      clientalt.socket.emit("newMessage", client.name + ": " + message); // processing of client id is done by server, client only sees name
    }
  });

  socket.on("createRoom", () => {
    console.log("createRoom");
    let roomCode = generateRandomRoomCode();
    let room = new Room(roomCode);
    rooms.push(room);
    room.addClient(client);
    client.room = room;
    console.log(client.room)
    socket.emit("setRoomCode", roomCode);
  });

  socket.on("joinRoom", (roomCode) => {
    console.log("joinRoom", roomCode);
    for (let room of rooms) {
      if (room.id === roomCode) {
        room.addClient(client);
        console.log("new client added to room", room.id)
        socket.emit("setRoomCode", roomCode);
      }
    }
  });

  socket.on("disconnect", () => {
    if (client.room) {
      client.room.removeClient(client);
    }
    clients.delete(client);
    // clients.forEach((c) => {
    //   c.socket.emit("clientDisconnected", client.id);
    // });
  });
})

function generateRandomRoomCode() {
  return (+new Date()).toString(36).slice(-5);
}
