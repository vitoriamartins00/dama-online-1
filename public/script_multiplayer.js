// const { Manager } = require("socket.io-client")
import { Manager } from "socket.io-client";

const oi_path = "http://localhost:3080";

const manager = new Manager(oi_path);

const player = manager.socket("/");

const piece = document.createElement("div");

piece.classList.add("piece");

const b_piece = piece.cloneNode();
b_piece.classList.add("blue");

const b_dama = b_piece.cloneNode();
b_dama.classList.add("dama");

const r_piece = piece.cloneNode();
r_piece.classList.add("red");

const r_dama = r_piece.cloneNode();
r_dama.classList.add("dama");

// [[5,0], [5,2], [5,4], [5,6], [6,1], [6,3], [6,5], [6,7], [7,0], [7,2], [7,4], [7,6]]
let nome = ""

let color = null;

var b_points = 0;

var b_pieces = [];
var r_pieces = [];

// [[1,0], [1,2], [1,4], [1,6], [0,1], [0,3], [0,5], [0,7], [2,1], [2,3], [2,5], [2,7]]

var r_points = 0;

var selected_piece = [null, null];

var blue_turn = true;

let win = null

const update = (match_info) => {
    const room = match_info.room;

    color = color ? color : match_info.player.color;

    blue_turn = color == "blue" ? room.blue_turn : !room.blue_turn;

    let play = color == "blue" ? room.blue : room.red;

    b_pieces = play.pieces;

    r_pieces = play.enemies.pieces;

    b_points = play.points;
    r_points = play.enemies.points;

    win = room.win

    game()
};

// restart
player.on("start", (match_info) => {
    update(match_info);
    nome = match_info.nome
    r_pieces.forEach((id) => piece_init([r_piece, r_dama], id));

    b_pieces.forEach((id) => piece_init([b_piece, b_dama], id));
});

const piece_erase = (id) => {
    const [row, col] = id.coords;
    document.getElementById(`${row}-${col}`).innerHTML = "";
    document.getElementById(`${row}-${col}`).onclick = null;
};

const piece_init = (piece, id) => {
    const [row, col] = id.coords;
   
    if(id.dama){
        piece = piece[1]
    }else{
        piece = piece[0]
    }
    document.getElementById(`${row}-${col}`).appendChild(piece.cloneNode(true));
};

player.on("up_movement", (room, changes) => {

    changes[color].removed.forEach(erase=>{piece_erase(erase)});

    piece_init(blue_turn ? [b_piece, b_dama] : [r_piece, r_dama], changes[color].added);

    update({ room, player: { color: color }});
    
});

const move_piece = (row, col, direction) => {
    
    player.emit("move_piece", {
        from: selected_piece,
        direction: direction,
        to: [row, col],
    });
   
};

const add_land_area = (row, col, direction) => {
    document.getElementById(`${row}-${col}`).classList.add("next-sel");
    document.getElementById(`${row}-${col}`).onclick = () =>
        move_piece(row, col, direction);
};

const add_land_area_enemy = (row, col)=>{
    document.getElementById(`${row}-${col}`).classList.add("next-sel");
}

const remove_land_area = (row, col) => {
    const ele = document.getElementById(`${row}-${col}`);
 
    ele.classList.remove("next-sel");
    ele.onclick = null;
};

const clean_piece_select = () => {
    const id = selected_piece[0];
    if (id) {
        id.to_land.NW
            ? id.to_land.NW.forEach((e) => remove_land_area(e[0], e[1]))
            : null;
        id.to_land.NE
            ? id.to_land.NE.forEach((e) => remove_land_area(e[0], e[1]))
            : null;
        id.to_land.SW
            ? id.to_land.SW.forEach((e) => remove_land_area(e[0], e[1]))
            : null;
        id.to_land.SE
            ? id.to_land.SE.forEach((e) => remove_land_area(e[0], e[1]))
            : null;
    }

    selected_piece = [null, null];
};

player.on("piece_selected", (res) => {
    const id = res[color];
    
    if(!blue_turn){
        clean_piece_select()
        selected_piece[0] = id;
        id.to_land.NW
            ? id.to_land.NW.forEach((e) => add_land_area_enemy(e[0], e[1]))
            : null;

        id.to_land.NE
            ? id.to_land.NE.forEach((e) => add_land_area_enemy(e[0], e[1]))
            : null;
        id.to_land.SW
            ? id.to_land.SW.forEach((e) => add_land_area_enemy(e[0], e[1]))
            : null;
        id.to_land.SE
            ? id.to_land.SE.forEach((e) => add_land_area_enemy(e[0], e[1]))
            : null;
        return
    }
    
    
    selected_piece[0] = id;
    id.to_land.NW
        ? id.to_land.NW.forEach((e) => add_land_area(e[0], e[1], "NW"))
        : null;

    id.to_land.NE
        ? id.to_land.NE.forEach((e) => add_land_area(e[0], e[1], "NE"))
        : null;
    id.to_land.SW
        ? id.to_land.SW.forEach((e) => add_land_area(e[0], e[1], "SW"))
        : null;
    id.to_land.SE
        ? id.to_land.SE.forEach((e) => add_land_area(e[0], e[1], "SE"))
        : null;
    
});

const piece_selected = (id, idx) => {
    clean_piece_select();
    selected_piece[1] = idx
    player.emit("click_cheack_blanks", [id, idx]);
};

const remove_click = (id) => {
    const [row, col] = id.coords;

    document.getElementById(`${row}-${col}`).onclick = null;
};

const add_click = (id, idx) => {
    const [row, col] = id.coords;

    document.getElementById(`${row}-${col}`).onclick = () =>
        piece_selected(id, idx);
};

const set_ur_turn = ()=>{
    document.getElementById("turno").innerText = "Sua vez!"
    b_pieces.forEach((id, idx) => add_click(id, idx))
}

const unset_ur_turn = ()=>{
    document.getElementById("turno").innerText = "Vez do adverário"
    b_pieces.forEach((id) => remove_click(id));
}

const game = () => {
    clean_piece_select()
    blue_turn
        ? set_ur_turn()
        : unset_ur_turn()
    
    // show points
    document.getElementById("points-red").innerText = `${r_points? r_points : 0}`
    document.getElementById("points-blue").innerText = `${b_points? b_points : 0}`
    if(win){
        if(win == color){
            document.querySelector(".display p").innerText = `${nome}, parabéns!!!`
        }else{
            document.querySelector(".display p").innerText = `${nome}, não foi dessa vez. Você perdeu.`
        }
        
        document.querySelector("div#modal").classList.remove("hidden")
        document.querySelector("div#modal").classList.add("modal")
        
    }
    
};

player.on("go-to", (url)=>{
    window.location.href = url
})