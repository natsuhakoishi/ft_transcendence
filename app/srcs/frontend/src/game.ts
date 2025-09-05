const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("Client connected to server");
    ws.send("Hiiii");
};

ws.onmessage = (event) => {
    console.log("server: ", event.data);
}