/*
BreakPong - keyboard.js

Keyboard utility functions.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

var key_map = {
    "a": false,
    "d": false,
    "A": false,
    "D": false,
    "ArrowLeft": false,
    "ArrowRight": false,
    "Enter": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false
}


function update_keys(key) {
    let key_name = key.key;
    let old_key = key_map[key_name];
    if (key.type == "keydown") {
        key_map[key_name] = true;
    } else {
        key_map[key_name] = false;
    }
}

export function get_keys() {
    return key_map;
}

export function run_on_press(func, ...keys_wanted) {
    var el = document.addEventListener("keydown", (key) => {
        if (keys_wanted.includes(key.key)) func(key.key)
        else {
            return run_on_press(func, ...keys_wanted);
        }
    }, { once: true });
    return el;
}

document.addEventListener("keydown", update_keys);
document.addEventListener("keyup", update_keys);

function UNUSEDkey_press_event() {
    // Title of game
    if (key_listener == "start") {

    } else if (key_listener == "difficulty") {

        // If valid difficulty key was detected, start the game
        if (key_listener == "start_game") {

        }
    } else if (key_listener == "game") {
        force = 0.4;
        // Change direction of upper paddle
        if (key_map["a"] && key_map["d"]) {
            paddle_top_dx -= Math.sign(paddle_top_dx) * Math.min(Math.abs(paddle_friction), Math.abs(paddle_top_dx)) / 3;
        } else if (key_map["a"]) {
            paddle_top_dx -= force;
        } else if (key_map["d"]) {
            paddle_top_dx += force;
        }
        if (Math.abs(paddle_top_dx) > MAX_SPEED) {
            paddle_top_dx = MAX_SPEED * Math.sign(paddle_top_dx)
        }
        // Change direction of lower paddle
        if (key_map["ArrowLeft"] && key_map["ArrowRight"]) {
            paddle_bottom_dx = 0;
        } else if (key_map["ArrowLeft"]) {
            paddle_bottom_dx -= force;
        } else if (key_map["ArrowRight"]) {
            paddle_bottom_dx += force;
        }
        if (Math.abs(paddle_bottom_dx) > MAX_SPEED) {
            paddle_bottom_dx = MAX_SPEED * Math.sign(paddle_bottom_dx)
        }
    }
}