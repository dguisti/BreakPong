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

    static add_timer(func, time, clearable = true, name = null, ...args) {
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
            func(...args);
            Timer.remove_timer(name);
        }, time);

        // Add to object
        Timer.timers[name] = timer;
        Timer.clearable_timers[name] = clearable;

        return timer;
    }

    static clear_timer(id) {
        /* clearTimer(id) - Clear a timer.
        Arguments: id - The id of the timer to clear.
        Returns: Nothing.
        */

        clearTimeout(id);
    }

    static clear_timer_name(name) {
        /* clearTimer(name) - Clear a timer.
        Arguments: name - The name of the timer to clear.
        Returns: Nothing.
        */
        if (!name in Timer.timers) {
            throw new Error("Timer does not exist.");
        }
        clearTimeout(Timer.timers[name]);
        this.remove_timer(name);
    }

    static remove_timer(name) {
        /* removeTimer(name) - Remove a timer from the timer list.
        Arguments: name - The name of the timer to remove.
        Returns: Nothing.
        */

        Reflect.deleteProperty(Timer.timers, name);
        if (name in Timer.clearable_timers) Reflect.deleteProperty(Timer.clearable_timers, name);
    }

    static clear_timers() {
        /* clearTimers() - Clear all timers.
        Arguments: None.
        Returns: Nothing.
        */


        for (const [name, id] of Object.entries(Timer.timers)) {
            Timer.clear_timer_name(name);
        }
    }
}