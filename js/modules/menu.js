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

// Necessary variables
var background_color = Config.main.background_color;

export function initialize() {
    // Background rect
    fill_canvas(background_color)

    // Title + Welcome text
    ctx.strokeStyle = Config.menu.title.text_color;

    let welcome_height = Config.menu.title.welcome_height;
    let title_height = Config.menu.title.title_height;
    let info_height = Config.menu.title.info_height;

    let time_dif = Config.menu.title.time_dif;

    let delay = Config.menu.title.delay;

    let welcome_timer = Timer.add_timer(function () {
        ctx.font = `bold ${welcome_height}px Copperplate`;
        ctx.textAlign = "center";
        ctx.strokeText("Welcome    ", doc_width / 2, doc_height / 2 - title_height - welcome_height * 1.5);
    }, time_dif * 0 + delay, true, "title_welcome");

    let to_timer = Timer.add_timer(function () {
        ctx.font = `bold ${welcome_height}px Copperplate`;
        ctx.textAlign = "center";
        ctx.strokeText("to", doc_width / 2 + ctx.measureText("Welcome ").width / 2, doc_height / 2 - title_height - welcome_height * 1.5);
    }, time_dif * 1 + delay, true, "title_to");

    let title_timer = Timer.add_timer(function () {
        ctx.font = `bold ${title_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("BreakPong", doc_width / 2, doc_height / 2 - title_height);
    }, time_dif * 2 + delay, true, "title_title");

    let info_timer = Timer.add_timer(function () {
        ctx.font = `bold ${info_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Press Enter To Start", doc_width / 2, doc_height / 2 + info_height);
    }, time_dif * 3 + delay, true, "title_info");

}