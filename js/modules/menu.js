/*
BreakPong - menu.js

Operate game menu.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

// Necessary modules
import { Config } from "./config.js";
import { ctx, fill_canvas } from "./canvas.js";
import { Timer } from "./timer.js";
import { doc_width, doc_height } from "./window.js";
import { run_on_press } from "./keyboard.js";
import { Data } from "./data.js";
import { prep_game } from "./game.js";

// Necessary variables
var background_color = Config.main.background_color;

export function initialize() {
    if (Config.hacker.skip_title) {
        goto_difficulty();
        return;
    }

    // Background rect
    fill_canvas(background_color)

    // Title + Welcome text
    ctx.strokeStyle = Config.menu.text_color;

    let welcome_height = Config.menu.title.welcome_height;
    let title_height = Config.menu.title.title_height;
    let info_height = Config.menu.title.info_height;

    let time_dif = Config.menu.title.time_dif;

    let delay = Config.menu.title.delay;

    Timer.add_timer(function () {
        ctx.font = `bold ${welcome_height}px Copperplate`;
        ctx.textAlign = "center";
        ctx.strokeText("Welcome    ", doc_width / 2, doc_height / 2 - title_height - welcome_height * 1.5);
    }, time_dif * 0 + delay, true, "title_welcome");

    Timer.add_timer(function () {
        ctx.font = `bold ${welcome_height}px Copperplate`;
        ctx.textAlign = "center";
        ctx.strokeText("to", doc_width / 2 + ctx.measureText("Welcome ").width / 2, doc_height / 2 - title_height - welcome_height * 1.5);
    }, time_dif * 1 + delay, true, "title_to");

    Timer.add_timer(function () {
        ctx.font = `bold ${title_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("BreakPong", doc_width / 2, doc_height / 2 - title_height);
    }, time_dif * 2 + delay, true, "title_title");

    Timer.add_timer(function () {
        ctx.font = `bold ${info_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Press Enter To Start", doc_width / 2, doc_height / 2 + info_height);
    }, time_dif * 3 + delay, true, "title_info");

    run_on_press(goto_difficulty, "Enter");

}

function goto_difficulty(key) {
    // Clear all timers
    Timer.clear_timers();
    if (Config.hacker.skip_difficulty) {
        selected_difficulty(Config.main.difficulty);
        return;
    }
    // Show difficulty
    display_difficulty();
}

function make_difficulty_select(number, text) {
    // Make difficulty select
    ctx.save();
    let dif_size = ctx.measureText("Difficulty").width;
    let difficulty_height = Config.menu.difficulty.difficulty_height;
    let selections_height = Config.menu.difficulty.selections_height;
    let box_padding = Config.menu.difficulty.box_padding;
    ctx.font = `bold ${selections_height}px Copperplate`;
    ctx.textAlign = "left";
    ctx.strokeText(text, doc_width / 2 - dif_size / 4, doc_height / 4 + difficulty_height * number);
    // Make box
    ctx.lineWidth = 3;
    ctx.strokeRect(doc_width / 2 - dif_size / 4 - box_padding, doc_height / 4 + difficulty_height * number - selections_height, dif_size / 2 + box_padding * 2, selections_height + box_padding * 2)
    ctx.restore();
}


export function display_difficulty() {
    // Clear canvas
    //ctx.fillStyle = background_color;
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    fill_canvas(background_color)

    ctx.strokeStyle = Config.menu.text_color;

    let time_dif = Config.menu.difficulty.time_dif;
    let difficulty_height = Config.menu.difficulty.difficulty_height;
    let difficulties = Config.menu.difficulties;

    let info_height = Config.menu.difficulty.info_height;

    Timer.add_timer(function () {
        ctx.font = `bold ${difficulty_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Difficulty", doc_width / 2, doc_height / 4);
    }, time_dif * 0, true, "difficulty_difficulty");

    for (const [number, text] of Object.entries(difficulties)) {
        Timer.add_timer(make_difficulty_select,
            time_dif * number,
            true,
            null,
            number,
            `${number}: ${text}`);
    }

    Timer.add_timer(function () {
        ctx.font = `bold ${info_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Press Key To Select", doc_width / 2, doc_height / 4 + difficulty_height * 5);
    }, time_dif * 5, true, "difficulty_press_start");

    run_on_press(selected_difficulty, "1", "2", "3", "4");
}

function selected_difficulty(num) {
    if (num == "4") {
        window.open("help");
        run_on_press(selected_difficulty, "1", "2", "3", "4");
    } else {
        // Set global difficulty
        //Data.difficulty = parseInt(num);
        Config.game.difficulty = parseInt(num);
        // Clear all timers
        Timer.clear_timers();
        prep_game();
    }
}