import { sleep, clamp, distance } from "./util.js";
import { ctx } from "./canvas.js";
import { doc_width, doc_height } from "./window.js";
import { Config } from "./config.js";
import { Timer } from "./timer.js";
import { EventDispatch } from "./dispatch.js";

export class PaddleFactory {
    paddles = [];
    async draw_init() {
        await sleep(1);
    }
}

class Paddle {
    
}