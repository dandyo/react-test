const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});

// I'm maintaining all active connections in this object
const clients = {};
// I'm maintaining all active users in this object
const users = {};
// The current editor content is maintained here.
let editorContent = null;
// User activity history.
let userActivity = [];
let numHistory = 0;

// Event types
const typesDef = {
    USER_EVENT: 'userevent',
    CONTENT_CHANGE: 'contentchange'
}

function broadcastMessage(json) {
    // We are sending the current data to all connected clients
    const data = JSON.stringify(json);
    for (let userId in clients) {
        let client = clients[userId];
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    };
}

function handleMessage(message, userId) {
    console.log(message.toString())
    const dataFromClient = JSON.parse(message.toString());
    const json = { type: dataFromClient.type };
    if (dataFromClient.type === typesDef.USER_EVENT) {
        users[userId] = dataFromClient;
        // userActivity.push(`${dataFromClient.username} joined to edit the document`);
        numHistory = numHistory + 1;
        json.data = { users, userActivity, numHistory };
    } else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
        editorContent = dataFromClient.content;
        json.data = { editorContent, userActivity };
    }
    broadcastMessage(json);
}

// A new client connection request received
wsServer.on('connection', function (connection) {
    // Generate a unique code for every user
    const userId = uuidv4();
    console.log(`Recieved a new connection.`);

    // Store the new connection and handle messages
    clients[userId] = connection;
    console.log(`${userId} connected.`);
    connection.on('message', (message) => handleMessage(message, userId));
});