/*
BreakPong - main.js

Main file for initializing
game mechanics.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

// Necessary modules
import { Config } from "./modules/config.js";
import { canvas, resize_canvas } from "./modules/canvas.js";
import { initialize } from "./modules/menu.js";
import { sleep } from "./modules/util.js";

async function main() {
    let loader = document.getElementById("load-flex-container");
    loader.classList.add("fadeout")
    let fade_time = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--fade-time')[0]);
    await sleep(fade_time * 1000)
    loader.remove();
    canvas.classList.add("fadein")
    document.body.appendChild(canvas);
    await sleep(fade_time * 1000)
    // Import necessary config values
    var run_interval = Config.main.run_interval;

    // Set initial canvas size
    resize_canvas();

    // Initialize game
    initialize();
}

main();