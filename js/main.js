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

// Import necessary config values
var run_interval = Config.main.run_interval;
var difficulty = Config.game.difficulty;

// Get window size
var doc_width = window.innerWidth;
var doc_height = window.innerHeight;

// Set initial canvas size
resize_canvas(doc_width, doc_height);

// Initialize game
initialize();