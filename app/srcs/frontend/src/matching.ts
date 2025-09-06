const ws = new WebSocket("ws://localhost:8080");

export function matching(): void {
    
    // const playerID: string | null = localStorage.getItem("PlayerID");

    // if (playerID)
    // {
        ws.onopen = () => {
            ws.send("1234");
            // ws.send(playerID);
        };
    // }

    let link: string = "https://localhost:3000/";

    ws.onmessage = (event) => {
        console.log(event.data);
        link += event.data;
        console.log(link);
        // window.location.href = link;
    };
}
