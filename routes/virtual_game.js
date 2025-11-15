const { piece_move, click_cheack_blanks } = require("./rules");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


const init_v_board = [
    [null, "red", null, "red", null, "red", null, "red"],
    ["red", null, "red", null, "red", null, "red", null],
    [null, "red", null, "red", null, "red", null, "red"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["blue", null, "blue", null, "blue", null, "blue", null],
    [null, "blue", null, "blue", null, "blue", null, "blue"],
    ["blue", null, "blue", null, "blue", null, "blue", null],
];

const init_pieces = [
    {
        coords: [7, 0],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [7, 2],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [7, 4],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [7, 6],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [5, 0],
        to_land: { NW: null, NE: [[4, 1]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [5, 2],
        to_land: { NW: [[4, 1]], NE: [[4, 3]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [5, 4],
        to_land: { NW: [[4, 3]], NE: [[4, 5]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [5, 6],
        to_land: { NW: [[4, 5]], NE: [[4, 7]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [6, 1],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [6, 3],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [6, 5],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [6, 7],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
];

const init_enemy_pieces = [
    {
        coords: [1, 0],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [1, 2],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [1, 4],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [1, 6],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [0, 1],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [0, 3],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [0, 5],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [0, 7],
        to_land: { NW: null, NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [2, 1],
        to_land: { NW: [[3, 0]], NE: [[3, 2]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [2, 3],
        to_land: { NW: [[3, 2]], NE: [[3, 4]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [2, 5],
        to_land: { NW: [[3, 4]], NE: [[3, 6]], SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
    {
        coords: [2, 7],
        to_land: { NW: [[3, 6]], NE: null, SW: null, SE: null },
        to_kill: { NW: null, NE: null, SW: null, SE: null },
        dama: false,
    },
];

const init_room = {
    red: {
        token: "",
        pieces: structuredClone(init_pieces),
        points: 0,
        enemies: {
            pieces: structuredClone(init_enemy_pieces),
            points: 0,
        },
        board: structuredClone(init_v_board),
        elim: null
    },
    blue: {
        token: "",
        pieces: structuredClone(init_pieces),
        points: 0,
        enemies: {
            points: 0,
            pieces: structuredClone(init_enemy_pieces)
        },
        board: structuredClone(init_v_board),
        elim: null
    },
    blue_turn: true,
    win: null
};

let room_incr = 0;

const game_rooms = {
    // room1: structuredClone(init_room),
};

const players_in_rooms = {
    // player1: ["room1", "blue"],
    // player2: ["room1", "red"],
};

const add_player_in_rooms = (player_token, room, color) => {
    players_in_rooms[player_token] = [room, color];
};

const remove_player_in_rooms = (player_token) => {
    delete players_in_rooms[player_token];
};

const get_disp_room_id = () => {
    room_incr += 1;
    return room_incr;
};

const create_game_room = (player1, player2, room_id) => {
    const p1_color = Math.floor(Math.random() * 2) == 0 ? "blue" : "red";

    const p2_color = p1_color == "blue" ? "red" : "blue";

    add_player_in_rooms(player1, room_id, p1_color);
    add_player_in_rooms(player2, room_id, p2_color);

    game_rooms[room_id] = structuredClone(init_room);

    game_rooms[room_id].blue.token = p1_color == "blue" ? player1 : player2;
    game_rooms[room_id].red.token = p1_color == "red" ? player1 : player2;

    return room_id;
};

const remove_game_room = (room_id) => {
    delete game_rooms[room_id];
};

const untoken_id = (token) => {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "08304b48f517247ad7af5f57"
    );
    return decoded.id;
};

const game = (io) => {
    io.on("connection", async (socket) => {
        if (!socket.handshake.headers.cookie) {
            return;
        }
        let token = null;
        socket.handshake.headers.cookie.split(";").forEach((ele, idx) => {
            let [key, val] = ele.trim().split("=");

            if (key == "sessionToken") {
                socket.data.player = val;

                const room = players_in_rooms[val];

                if (room && game_rooms[room[0]]) {
                    socket.join(players_in_rooms[val][0]);
                    socket.data.room = players_in_rooms[val][0];
                    socket.data.color = players_in_rooms[val][1];
                    token = val;
                } else {
                    remove_player_in_rooms(val);
                    socket.emit("go-to", "/jogo.html");
                }
            }
        });

        if(!token){return}
       
        const user = await User.findById(untoken_id(token));
      
        socket.emit("start", {
            room: game_rooms[socket.data.room],
            player: {
                color: socket.data.color,
            },
            nome: user.nomeusuario,
        });

        socket.on("click_cheack_blanks", (select_piece) => {
            const res = click_cheack_blanks(
                game_rooms[socket.data.room],
                select_piece,
                socket.data.color
            );
            io.to(socket.data.room).emit("piece_selected", res);
        });

        socket.on("move_piece", (info) => {
            const changes = piece_move(
                game_rooms[socket.data.room],
                info,
                socket.data.color
            );
            const room = socket.data.room;

            io.to(room).emit(
                "up_movement",
                game_rooms[socket.data.room],
                changes
            );
        });

        socket.on("disconnect", () => {
            if (socket.data.room) {
                socket.leave(socket.data.room);

                const sockets = io.in(socket.data.room).fetchSockets();

                if (sockets.length == 0) {
                    remove_game_room(socket.data.room);
                }
            }
        });
    });
};

module.exports = { game, create_game_room, get_disp_room_id };
