const jwt = require('jsonwebtoken');
const User = require("../models/user");

const select_to_land = (
    row,
    col,
    board,
    left = true,
    ford = true,
    step_lim = 1,
    color
) => {
    let step_x = 0 
    let step_y = 0  
    let count = 0;
    let result = { to_elim: null, to_land: null };

    try {
        while (count < step_lim) {
            step_x = left ? step_x - 1 : step_x + 1;
            step_y = ford ? step_y - 1 : step_y + 1;

            if(!(0<=(row + step_y)&&(row + step_y)<= 7)){throw new Error("a")}
            if(!(0<=(col + step_x)&&(col + step_x)<= 7)){throw new Error("a")}

            block = board[row + step_y][col + step_x];
            block_coords = [row + step_y, col + step_x];

            // se tiver algo dentro do bloco'
            if (block) {
                // ve se é aliado e se for não vai pular por cima dele [throw Error()]
                if (block == "blue") {
                    block = null;
                    block_coords = null;
                    break;
                }

                // ve se é inimigo e se for vai pular por cima dele
                if (block == "red") {
                    result.to_elim = block_coords;

                    step_x = left ? step_x - 1 : step_x + 1;
                    step_y = ford ? step_y - 1 : step_y + 1;

                    // pega o blocoo de aterrisagem
                    block = board[row + step_y][col + step_x];
                    block_coords = [row + step_y, col + step_x];

                    if(!(0<=(row + step_y)&&(row + step_y)<= 7)){throw new Error("a")}
                    if(!(0<=(col + step_x)&&(col + step_x)<= 7)){throw new Error("a")}

                    // ve se tem esspaço para aterrisar apopps pular inimigoo, se n tiver
                    if (block) {
                        block = null;
                        break;
                    }
                    result.to_land
                        ? result.to_land.push(block_coords)
                        : (result.to_land = [block_coords]);

                    break;
                }
            }
            count += 1;
            result.to_land
                ? result.to_land.push(block_coords)
                : (result.to_land = [block_coords]);
        }
    } catch (error) {}

    return result;
};

const piece_erase = (allies, enemies, idx, color) => {
    let res = {};

    allies.pieces = allies.pieces.filter((p)=>!(p.coords[0] == idx[0] && p.coords[1] == idx[1]))
    allies.enemies.pieces = allies.enemies.pieces.filter((p)=>!(p.coords[0] == idx[0] && p.coords[1] == idx[1]))
    res[color] = {coords: idx}
    
    const e_pieces = enemies.enemies.pieces

    enemies.pieces = enemies.pieces.filter(p=>!(p.coords[0] == 7-idx[0] && p.coords[1] == 7-idx[1]))
    enemies.enemies.pieces = e_pieces.filter(p=>!(p.coords[0] == 7-idx[0] && p.coords[1] == 7-idx[1]))
    res[color == "blue" ? "red" : "blue"] = {coords: [7-idx[0], 7-idx[1]]}

    allies.board[idx[0]][idx[1]] = null;
    enemies.board[7 - idx[0]][7 - idx[1]] = null;

    return res;
};

const select_blank = (allies, enemies, idx, dama, color) => {
    const dash_lim = dama ? 7 : 1;
    const NW = select_to_land(
        idx[0],
        idx[1],
        allies.board,
        true,
        true,
        dash_lim,
        color
    );
    const NE = select_to_land(
        idx[0],
        idx[1],
        allies.board,
        false,
        true,
        dash_lim,
        color
    );
    let SW = { to_land: null, to_elim: null };
    let SE = { to_land: null, to_elim: null };
 
    if (dama){
        SW = select_to_land(
            idx[0],
            idx[1],
            allies.board,
            true,
            false,
            dash_lim,
            color
        );
        SE = select_to_land(
            idx[0],
            idx[1],
            allies.board,
            false,
            false,
            dash_lim,
            color
        );
    }else{
        if(allies.elim){
            if (allies.elim[0] == idx[0] && allies.elim[1] == idx[1]) {
                SW = select_to_land(
                    idx[0],
                    idx[1],
                    allies.board,
                    true,
                    false,
                    dash_lim,
                    color
                );
                if(!SW.to_elim){
                    SW = { to_land: null, to_elim: null };
                }
                SE = select_to_land(
                    idx[0],
                    idx[1],
                    allies.board,
                    false,
                    false,
                    dash_lim,
                    color
                );
                if(!SE.to_elim){
                    SE = { to_land: null, to_elim: null };
                }
            }
        }
    
    }

    const new_piece_allies = {
        coords: idx,
        to_land: {
            NW: NW.to_land,
            NE: NE.to_land,
            SW: SW.to_land,
            SE: SE.to_land,
        },
        to_kill: {
            NW: NW.to_elim,
            NE: NE.to_elim,
            SW: SW.to_elim,
            SE: SE.to_elim,
        },
        dama: dama,
    };

    const new_piece_enemies = {
        coords: [7 - idx[0], 7 - idx[1]],
        to_land: {
            NW: NW.to_land ? NW.to_land.map((e) => [7 - e[0], 7 - e[1]]) : null,
            NE: NE.to_land ? NE.to_land.map((e) => [7 - e[0], 7 - e[1]]) : null,
            SW: SW.to_land ? SW.to_land.map((e) => [7 - e[0], 7 - e[1]]) : null,
            SE: SE.to_land ? SE.to_land.map((e) => [7 - e[0], 7 - e[1]]) : null,
        },
        to_kill: {
            NW: NW.to_elim ? NW.to_elim.map((e) => [7 - e[0], 7 - e[1]]) : null,
            NE: NE.to_elim ? NE.to_elim.map((e) => [7 - e[0], 7 - e[1]]) : null,
            SW: SW.to_elim ? SW.to_elim.map((e) => [7 - e[0], 7 - e[1]]) : null,
            SE: SE.to_elim ? SE.to_elim.map((e) => [7 - e[0], 7 - e[1]]) : null,
        },
        dama: dama,
    };

    allies.pieces.map((p, i) => {
        if(!p){return}
        if (
            allies.pieces[i].coords[0] == idx[0] &&
            allies.pieces[i].coords[1] == idx[1]
        ) {
            
            allies.pieces[i] = new_piece_allies;
        }
    });

    enemies.enemies.pieces.map((p, i) => {
        if(!p){return}
        if (
            enemies.enemies.pieces[i].coords[0] == 7 - idx[0] &&
            enemies.enemies.pieces[i].coords[1] == 7 - idx[1]
        ) {
            
            enemies.enemies.pieces[i] = new_piece_enemies;
        }
    });

    return color == "blue"
        ? { blue: new_piece_allies, red: new_piece_enemies }
        : { red: new_piece_allies, blue: new_piece_enemies };
};

const piece_init = (allies, enemies, idx, dama, color) => {
    const new_piece_allies = {
        coords: [idx[0], idx[1]],
        to_land: {
            NW: null,
            NE: null,
            SW: null,
            SE: null,
        },
        to_kill: {
            NW: null,
            NE: null,
            SW: null,
            SE: null,
        },
        dama: dama,
    };

    const new_piece_enemies = {
        coords: [7 - idx[0], 7 - idx[1]],
        to_land: {
            NW: null,
            NE: null,
            SW: null,
            SE: null,
        },
        to_kill: {
            NW: null,
            NE: null,
            SW: null,
            SE: null,
        },
        dama: dama,
    };

    allies.board[idx[0]][idx[1]] = "blue";
    enemies.board[7 - idx[0]][7 - idx[1]] = "red";

    allies.pieces.push(new_piece_allies);
    enemies.enemies.pieces.push(new_piece_enemies);

    return color == "blue"
        ? { blue: new_piece_allies, red: new_piece_enemies }
        : { red: new_piece_allies, blue: new_piece_enemies };
};

const click_cheack_blanks = (match, select_piece, color)=>{
    let allies = match[color];
    let enemies = match[color == "blue" ? "red" : "blue"];
    
    const selected = select_blank(allies, enemies, select_piece[0].coords,  select_piece[0].dama, color)

    return{
        blue: selected.blue,
        red: selected.red,
    };
}

const select_to_die = (allies, enemies, from, direction, to, color)=>{
    const to_kill = allies.pieces[from[1]].to_kill[direction]
  
    if(!to_kill){return};

    if((direction == "NW" || direction == "SW")){
        if(to[1] > to_kill[1]){
            return null
        }
        allies.points += 1
        enemies.enemies.points += 1
        return piece_erase(allies, enemies, to_kill, color)
    }

    if((direction == "NE" || direction == "SE")){
        if(to[1] < to_kill[1]){
            return null
        }
        allies.points += 1
        enemies.enemies.points += 1
        return piece_erase(allies, enemies, to_kill, color)
    }
}

const piece_move = (match, info, color) => {
    const { from, direction, to } = info;

    let allies = match[color];
    let enemies = match[color == "blue" ? "red" : "blue"];

    if(to[0] == 0){
        from[0].dama = true
    }

    const added = piece_init(allies, enemies, to, from[0].dama, color);

    const killed = select_to_die(allies, enemies, from, direction, to, color)

    const removed = piece_erase(allies, enemies, from[0].coords, color);
    

    allies.elim = killed? color == "blue"? added.blue.coords : added.red.coords : null
   
    game(match, killed)

    return {
        blue: {
            removed: killed? [removed.blue, killed.blue]: [removed.blue],
            added: added.blue,
        },
        red: {
            removed: killed? [removed.red, killed.red]: [removed.red],
            added: added.red,
        },
    };
};

const untoken_id = (token)=>{
    const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET ||'08304b48f517247ad7af5f57'
    );
    return decoded.id;
}

const game = async (match, killed)=>{
    match.blue_turn = killed? match.blue_turn : !match.blue_turn
    if(match.red.enemies.pieces.length == 0){
        match.win = "red"

        await User.findByIdAndUpdate(untoken_id(match.red.token), {$inc: {paridas_vencidas: 1}})
    }
    if(match.blue.enemies.pieces.length == 0){
        match.win = "blue"
        await User.findByIdAndUpdate(untoken_id(match.blue.token), {$inc: {paridas_vencidas: 1}})
    }
}

module.exports = { piece_move, click_cheack_blanks };
