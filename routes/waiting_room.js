const queue = [];
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { create_game_room, get_disp_room_id } = require("./virtual_game");

const untoken_id = (token) => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "08304b48f517247ad7af5f57"
  );
  console.log(decoded);
  return decoded.id;
};

const waiting_room = (io) => {
  io.of("/waiting").on("connection", async (socket) => {
    let token = null;

    if (!socket.handshake.headers.cookie) {
      return;
    }

    socket.handshake.headers.cookie.split(";").forEach((ele, idx) => {
      let [key, val] = ele.trim().split("=");

      if (key == "sessionToken") {
        socket.data.token = val;
        token = val;
      }
    });

    if (queue.length > 0) {
      const p2_socket = queue.shift();

      const room_id = get_disp_room_id();

      const s = create_game_room(token, p2_socket.data.token, room_id);

      console.log(untoken_id(p2_socket.data.token));

      console.log(untoken_id(token));

      if (s) {
        await User.findByIdAndUpdate(untoken_id(p2_socket.data.token), {
          $inc: { partidas_jogadas: 1 },
        });
        await User.findByIdAndUpdate(untoken_id(token), {
          $inc: { partidas_jogadas: 1 },
        });

        p2_socket.emit("go-to-game", s);
        socket.emit("go-to-game", s);
      }
    } else {
      queue.push(socket);
    }

    socket.on("disconnect", () => {
      const id_idx = queue.findIndex((id) => id.id == socket.id);
      queue.splice(id_idx, 1);
    });
  });
};

module.exports = { waiting_room };
