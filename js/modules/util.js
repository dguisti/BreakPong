/*
BreakPong - util.js

Utility functions for the game.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

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