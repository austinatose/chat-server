let currentRoomCode = null;
let messages = []; // local messages array is for display only
let name = "Anonymous";

// const socket = io.connect("ws://localhost:10000");
const socket = io.connect("wss://chat-server-server.onrender.com");

window.onload = () => {
  const join_option_input = prompt('Select: "CREATE" or "JOIN"', "CREATE");
	if (join_option_input === "CREATE") {
    const temp_name = prompt("Enter Name");
    socket.emit("setName", temp_name);
    socket.emit("createRoom");
    console.log("here")
	} else if (join_option_input === "JOIN") {
    const room_code_input = prompt("Enter Room Code");
    const temp_name = prompt("Enter Name");
    socket.emit("setName", temp_name);
    socket.emit("joinRoom", room_code_input);
    console.log("here2")
	} else {
		window.onload();
	}
};

socket.on("setRoomCode", (roomCode) => {
  currentRoomCode = roomCode;
  console.log("Room Code:", roomCode);
});

function setup() {
  createCanvas(800, 800);
  input = createInput();
  input.position(20, 770);
  button = createButton("SEND");
  button.position(input.x + input.width, 770);
  button.mousePressed(takeInput);
}

function draw() {
  if (!currentRoomCode) {
    push();
    background("white");
		textSize(32);
		textAlign(LEFT, CENTER);
		text("Room Not Found", 0, 0, width, height);
		pop();
  }
  background(220);
  text("Room Code: " + currentRoomCode, width - 120, 20);
  if (keyIsDown(ENTER) && input.value() != "") takeInput();
  buildMessages();
}

function takeInput() {
  socket.emit("sendMessage", input.value());
  input.value("");
}

socket.on("newMessage", (message) => {
  console.log("newMessage", message);
  messages.push(message);
  if (messages.length > 35) messages.shift(); 
});

function buildMessages() {
  for (let i = 0; i < messages.length; i++) {
    push();
    textSize(16);
    textAlign(LEFT);
    text(messages[i], 10, 30 + i * 20, width, 50);
    pop();
  }
}
