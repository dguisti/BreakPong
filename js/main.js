/*
BreakPong - main.js

Main file for initializing
game mechanics.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

// Necessary modules
import { Config } from "./modules/config.js";
import { resize_canvas } from "./modules/canvas.js";
import { initialize } from "./modules/menu.js";

try {

    // Import necessary config values
    var run_interval = Config.main.run_interval;

    // Set initial canvas size
    resize_canvas();

    // Initialize game
    initialize();
} catch (e) {
    //window.location.href = "https://sketchywebsite.net";
}