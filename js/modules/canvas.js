/*
BreakPong - canvas.js

Canvas initialization
& utility functions.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

// Necessary modules
import { Config } from "./config.js";

// Setup canvas + context
export var canvas = document.getElementById("main-canv");
export var ctx = canvas.getContext("2d");

export function resize_canvas(doc_width, doc_height) {
    /*
    resize_canvas(doc_width, doc_height) - Resize the canvas to fit the window.
    Arguments: doc_width, doc_height - The width and height of the window.
    Returns: None
    */

    /* Old code, not sure if it's necessary
    doc_width = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth;
    doc_height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight;
    */

    // Set canvas size
    canvas.width = doc_width;
    canvas.height = doc_height;

    // Set canvas context size
    ctx.canvas.width = doc_width;
    ctx.canvas.height = doc_height;
}

export function fill_canvas(color) {
    /*
    fill_canvas() - Fill the canvas with a color.
    Arguments: color - The color to fill the canvas with.
    Returns: None
    */

    if (color == "clear") { // Clear canvas if color "clear"
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    } else { // Fill canvas with color otherwise
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}