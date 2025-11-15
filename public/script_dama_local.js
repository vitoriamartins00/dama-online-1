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


var b_damas = [[6, 7]];

var b_points = 0;

var b_pieces = [];
var r_pieces = [];


var r_damas = [[2, 7]];

var r_points = 0;

var next = [];

var selected_piece = null;

var blue_turn = true;

const move = (to) => {
    from = selected_piece;
    new_loc = to.id.split("-").map((val) => parseInt(val));

    piece_erase(from);
    clean_next();

    let is_dama = false;
    if (blue_turn) {
        is_dama = b_damas.filter((val) => `${val}` == `${from}`).length > 0;
    } else {
        is_dama = r_damas.filter((val) => `${val}` == `${from}`).length > 0;
    }

    piece_model = blue_turn
        ? is_dama
            ? b_dama
            : b_piece
        : is_dama
        ? r_dama
        : r_piece;

    if (blue_turn) {
        ori_len = b_pieces.length;

        if (is_dama) {
            b_damas = b_damas.filter((val) => `${val}` != `${from}`);
            b_damas.push(new_loc);
        } else {
            if (new_loc[0] == 0) {
                b_pieces = b_pieces.filter((val) => `${val}` != `${from}`);
                b_damas.push(new_loc);
                piece_model = b_dama;
            } else {
                b_pieces = b_pieces.filter((val) => `${val}` != `${from}`);
                b_pieces.push(new_loc);
            }
        }
    } else {
        ori_len = r_pieces.length;
        if (is_dama) {
            r_damas = r_damas.filter((val) => `${val}` != `${from}`);
            r_damas.push(new_loc);
        } else {
            if (new_loc[0] == 7) {
                r_pieces = r_pieces.filter((val) => `${val}` != `${from}`);
                r_damas.push(new_loc);
                piece_model = r_dama;
            }
            r_pieces = r_pieces.filter((val) => `${val}` != `${from}`);
            r_pieces.push(new_loc);
        }
    }

    piece_init(piece_model, new_loc);

    const elim = eliminate(from, new_loc);

    blue_turn = elim ? blue_turn : !blue_turn;

    game(elim);
};

const next_init = () => {
    next.forEach((ntx) => {
        ntx.classList.add("next-sel");
        ntx.onclick = null;
        ntx.onclick = () => move(ntx);
    });
};

const clean_next = () => {
    try {
        next.forEach((prev) => {
            prev.classList.remove("next-sel");
            prev.onclick = null;
        });
        next = [];
        selected_piece = null;
    } catch (error) {}
};

const get_block = (row, col) => {
    return document.getElementById(`${row}-${col}`);
};

const select_blank = (
    row,
    col,
    left = true,
    ford = true,
    red = false,
    step_lim = 1
) => {
    step_x = left ? -1 : 1;
    step_y = ford ? -1 : 1;
    count = 0;
    slq = [];
    try {
        while (count < step_lim) {
            block = get_block(row + step_y, col + step_x);

            step_x = left ? step_x - 1 : step_x + 1;
            step_y = ford ? step_y - 1 : step_y + 1;

            // se tiver algo dentro do bloco'
            if (block.childNodes.length > 0) {
                // ve se é aliado e se for não vai pular por cima dele [throw Error()]
                if (
                    block.childNodes
                        .item(0)
                        .classList.contains(red ? "red" : "blue")
                ) {
                    block = null;
                    break;
                }
                // ve se é inimigo e se for vai pular por cima dele
                if (
                    block.childNodes
                        .item(0)
                        .classList.contains(!red ? "red" : "blue")
                ) {
                    if (ford) {
                        if (left) {
                            to_elim["NW"] = block;
                        } else {
                            to_elim["NE"] = block;
                        }
                    } else {
                        if (left) {
                            to_elim["SW"] = block;
                        } else {
                            to_elim["SE"] = block;
                        }
                    }

                    // pega o blocoo de aterrisagem
                    block = get_block(row + step_y, col + step_x);

                    // ve se tem esspaço para aterrisar apopps pular inimigoo, se n tiver
                    if (block.childNodes.length != 0) {
                        block = null;
                        break;
                    }
                    block ? slq.push(block) : null;
                    break;
                }
            }
            count += 1;
            block ? slq.push(block) : null;
        }
    } catch (error) {}

    return slq;
};

const eliminate = (from, new_loc) => {
    const [elim, direction] =
        new_loc[0] < from[0]
            ? new_loc[1] < from[1]
                ? [to_elim.NW, "NW"]
                : [to_elim.NE, "NE"]
            : new_loc[1] < from[1]
            ? [to_elim.SW, "SW"]
            : [to_elim.SE, "SE"];

    if (!elim) {
        return false;
    }

    const elim_coords = elim.id.split("-").map((val) => parseInt(val));

    if (
        (direction == "SW" || direction == "NW") &&
        elim_coords[1] < new_loc[1]
    ) {
        return false;
    }

    if (
        (direction == "SE" || direction == "NE") &&
        elim_coords[1] > new_loc[1]
    ) {
        return false;
    }

    if (!blue_turn) {
        r_points += 1;
        b_pieces = b_pieces.filter((val) => `${val}` != `${elim_coords}`);
        b_damas = b_damas.filter((val) => `${val}` != `${elim_coords}`);
        piece_erase(elim_coords);

        return true;
    } else {
        b_points += 1;
        r_pieces = r_pieces.filter((val) => `${val}` != `${elim_coords}`);
        r_damas = r_damas.filter((val) => `${val}` != `${elim_coords}`);
        piece_erase(elim_coords);

        return true;
    }
};

const show_turn = () => {
    document.getElementById("turno").innerText = blue_turn
        ? "Azul"
        : "Vermelho";
};

const show_points = () => {
    document.getElementById("points-red").innerText = `${
        r_points ? r_points : 0
    }`;
    document.getElementById("points-blue").innerText = `${
        b_points ? b_points : 0
    }`;
};

const piece_erase = (id) => {
    const [row, col] = id;
    document.getElementById(`${row}-${col}`).innerHTML = "";
    document.getElementById(`${row}-${col}`).onclick = null;
};

const piece_init = (piece, id) => {
    const [row, col] = id;

    document.getElementById(`${row}-${col}`).appendChild(piece.cloneNode());
};

const set_select_pieces = (pieces, action, elim) => {
    pieces.forEach((id) => {
        const [row, col] = id;
        document.getElementById(`${row}-${col}`).onclick = () =>
            action(id, elim, blue_turn);
    });
};
const clean_select_pieces = (pieces) => {
    pieces.forEach((id) => {
        const [row, col] = id;
        document.getElementById(`${row}-${col}`).onclick = null;
    });
};

const select_piece = (id, elim, blue = true) => {
    clean_next();
    to_elim = { NW: null, NE: null, SW: null, SE: null };

    selected_piece = id;
    const [row, col] = id;

    next = blue
        ? select_blank(row, col)
        : select_blank(row, col, true, false, true);
    next = blue
        ? [...next, ...select_blank(row, col, false)]
        : [...next, ...select_blank(row, col, false, false, true)];

    if (elim) {
        row_incre = blue ? 2 : -2;
        back = blue
            ? select_blank(row, col, true, false)
            : select_blank(row, col, true, true, true);
        if (back.length == 1) {
            back_coords = back[0].id.split("-").map((val) => parseInt(val));
            if (
                (back_coords[0] == row + row_incre) &
                (back_coords[1] == col - 2)
            ) {
                next = [...next, ...back];
            }
        }

        back = blue
            ? select_blank(row, col, false, false)
            : select_blank(row, col, false, true, true);
        if (back.length == 1) {
            back_coords = back[0].id.split("-").map((val) => parseInt(val));
            if (
                (back_coords[0] == row + row_incre) &
                (back_coords[1] == col + 2)
            ) {
                next = [...next, ...back];
            }
        }
    }

    next_init();
};

const select_dama = (id, elim, blue = true) => {
    clean_next();
    to_elim = { NW: null, NE: null, SW: null, SE: null };

    selected_piece = id;
    const [row, col] = id;

    // noroeste
    next = select_blank(row, col, true, true, !blue, 6);
    // nordeste
    next = [...next, ...select_blank(row, col, false, true, !blue, 6)];
    // sudoeste
    next = [...next, ...select_blank(row, col, true, false, !blue, 6)];
    // sudeste
    next = [...next, ...select_blank(row, col, false, false, !blue, 6)];

    next_init();
};

const game = (elim = false) => {
    console.log("blue: " + b_points, "red: " + r_points);
    show_turn();
    show_win();
    show_points();

    to_elim = { NW: null, NE: null, SW: null, SE: null };
    if (blue_turn) {
        set_select_pieces(b_pieces, select_piece, elim);
        set_select_pieces(b_damas, select_dama, elim);
        clean_select_pieces(r_pieces);
        clean_select_pieces(r_damas);
    } else {
        set_select_pieces(r_pieces, select_piece, elim);
        set_select_pieces(r_damas, select_dama, elim);
        clean_select_pieces(b_pieces);
        clean_select_pieces(b_damas);
    }
};

const show_win = () => {
    var winner = null;
    if (b_damas.length == 0 && b_pieces.length == 0) {
        winner = "Vermelho";
    }

    if (r_damas.length == 0 && r_pieces.length == 0) {
        winner = "Azul";
    }

    if (winner) {
        document.querySelector(
            ".display p"
        ).innerText = `${winner}, parabéns!!! Você é corno.`;
        document.querySelector("div#modal").classList.remove("hidden");
        document.querySelector("div#modal").classList.add("modal");
        document.getElementById("restart").onclick = restart;
    }
};

const restart = () => {
    document.querySelector("div#modal").classList.add("hidden");
    document.querySelector("div#modal").classList.remove("modal");
    document.getElementById("restart").onclick = null;

    b_pieces.forEach((piece) => piece_erase(piece));
    r_pieces.forEach((piece) => piece_erase(piece));

    b_damas.forEach((piece) => piece_erase(piece));
    r_damas.forEach((piece) => piece_erase(piece));

    blue_turn = true;

    b_pieces = [
        [7, 0],
        [7, 2],
        [7, 4],
        [7, 6],
        [5, 0],
        [5, 2],
        [5, 4],
        [5, 6],
        [6, 1],
        [6, 3],
        [6, 5],
        [6, 7]
    ];
    r_pieces = [
        [1, 0],
        [1, 2],
        [1, 4],
        [1, 6],
        [0, 1],
        [0, 3],
        [0, 5],
        [0, 7],
        [2, 1],
        [2, 3],
        [2, 5],
        [2, 7]
    ];

    b_damas = [];
    r_damas = [];

    b_points = 0;
    r_points = 0;

    r_pieces.forEach((id) => piece_init(r_piece, id));

    b_pieces.forEach((id) => piece_init(b_piece, id));

    game();
};

restart();
