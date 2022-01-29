/*
BreakPong - util.js

Utility functions for the game.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

export function random_string(length) {
    /* randomString(length) - Generate a random string of a given length.
    Arguments: length - The length of the string to generate.
    Returns: A random string of the given length.
    */

    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}