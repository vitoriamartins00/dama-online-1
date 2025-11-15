import { Manager } from "socket.io-client";

const oi_path = "http://localhost:3080";

const manager = new Manager(oi_path);

const player = manager.socket("/waiting");

console.log(player)

player.on("go-to-game", (s)=>{
    window.location.href = "/game-multiplayer"
})