/*
BreakPong - timer.js

Utilities for creating
and managing game timers.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

// Necessary modules
import { random_string } from "./util.js";

export class Timer {
    static timers = {};
    static clearable_timers = {};

    static add_timer(time, func, clearable = true, name = null) {
        /* addTimer(time, func, clearable, name) - Add a timer to the timer list.
        Arguments:  time - The time in milliseconds until the timer is executed.
                    func - The function to execute when the timer is executed.
                    clearable - Whether or not the timer can be cleared.
                    name - The name of the timer.
        Returns: The name of the timer.
        */

        if (name == null) {
            name = random_string(8);
        }

        // Add timer to object
        let timer = setTimeout(function () {
            // Run function
            func();
            Timer.remove_timer(name);
        }, time);

        // Add to object
        Timer.timers[name] = timer;
        Timer.clearable_timers[name] = clearable;
    }

    static clear_timer(name) {
        /* clearTimer(name) - Clear a timer.
        Arguments: name - The name of the timer to clear.
        Returns: Nothing.
        */
        if (!name in Timer.timers) {
            throw new Error("Timer does not exist.");
        }
        clearTimeout(Timer.timers[name]);
    }

    remove_timer(name) {
        /* removeTimer(name) - Remove a timer from the timer list.
        Arguments: name - The name of the timer to remove.
        Returns: Nothing.
        */

        Reflect.deleteProperty(Timer.timers, name);
        if (clearable) Reflect.deleteProperty(Timer.clearable_timers, name);
    }

    static clear_timers() {
        /* clearTimers() - Clear all timers.
        Arguments: None.
        Returns: Nothing.
        */

        for (let name in Timer.timers) {
            clearTimeout(Timer.timers[name]);
            remove_timer(name);
        }
    }
}