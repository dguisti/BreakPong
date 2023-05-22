import { sleep, clamp, distance, EventDispatch } from "../util.js";
import { ctx } from "../canvas.js";
import { doc_width, doc_height } from "../window.js";
import { Config } from "../config.js";
import { Timer } from "../timer.js";


class Paddle {
    constructor(data) {
        this.id = data.id;
        this.color = data.color;
        this.left_key = data.left_key;
        this.right_key = data.right_key;

        this.vx = 0;
        this.ax = 0;
        this.x = data.x;
        this.y = data.y;
        this.side = data.side;

        //this.force = data.force;
        //this.stop_force = data.stop_force;
        //this.friction = data.friction;
        
        this.width = data.width;
        this.height = data.height;
        //this.max_speed = data.max_speed;
        //this.bounciness = data.bounciness;
        this.velocity_tolerance = data.velocity_tolerance;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    move(keys) {
        //console.log(this.side, this.ax, this.vx)
        this.set_acceleration(keys);
        this.set_velocity();

        this.x += this.vx;

        this.check_collisions();

    }

    set_acceleration(keys) {
        if (keys[this.right_key] && keys[this.left_key]) { //this.right_key | this.left_key == 0 || this.right_key & this.left_key == 1
            // Both
            this.ax = 0;
            if (this.vx == 0) return
            let start_sign = Math.sign(this.vx);
            this.vx -= start_sign * Config.game.paddle.generic.stop_force;
            if (start_sign != Math.sign(this.vx)) this.vx = 0;
            this.normalize_velocity();
        }
        else if (keys[this.left_key]) {
            // Left
            this.ax = -Config.game.paddle.generic.force;
        }
        else if (keys[this.right_key]) {
            // Right
            this.ax = Config.game.paddle.generic.force;
        }
        else if (!(keys[this.right_key] || keys[this.left_key])) { //this.right_key | this.left_key == 0 || this.right_key & this.left_key == 1
            // Neither
            this.ax = 0;
        }
    }

    set_velocity() {
        this.vx += this.ax;
        this.vx -= Math.sign(this.vx) * Config.game.paddle.generic.friction;
        if (Math.abs(this.vx) > Config.game.paddle.generic.max_speed) {
            this.vx = Math.sign(this.vx) * Config.game.paddle.generic.max_speed
        }
        this.normalize_velocity();
    }

    // Possibly adjust
    check_collisions() {
        if (this.x + this.width >= doc_width) {
            this.bounce(doc_width - this.width - 1)
        }
        if (this.x <= 0) {
            this.bounce(1)
        }
    }

    bounce(x_boundary) {
        if (x_boundary > 0) {
            this.x = x_boundary;
        }
        this.vx *= -1 * Config.game.paddle.generic.bounciness//this.bounciness;
        if (this.vx < 0) this.vx = Math.max(this.vx, -Config.game.paddle.generic.max_speed)
        if (this.vx > 0) this.vx = Math.min(this.vx, Config.game.paddle.generic.max_speed)
        this.normalize_velocity();
    }

    normalize_velocity() {
        if (Math.abs(this.vx) < this.velocity_tolerance) this.vx = 0;
    }
}



export class PaddleFactory {
    constructor(generic, paddle_data) {
        this.paddles = [];
        for (const [id, paddle] of paddle_data.entries()) {
            // width, height, spacing, max_speed, force, friction
            let color = paddle.color;
            let controls = paddle.controls;
            let position = paddle.position;
            
            let pos_x = position.x;
            let pos_y = position.y;
            let side = paddle.side;
            
            if (pos_x == "center") pos_x = doc_width/2 - generic.width/2;
            else if (pos_x == "left") pos_x = generic.spacing;
            else if (pos_x == "right") pos_x = doc_width - generic.spacing - generic.width;
            
            if (pos_y == "center") pos_y = doc_height/2  - generic.height/2;
            if (pos_y == "top") pos_y = generic.spacing;
            if (pos_y == "bottom") pos_y = doc_height - generic.spacing - generic.height;

            let left_key = paddle.controls[0];
            let right_key = paddle.controls[1];

            let paddle_obj_data = {
                id: id,
                color: color,
                left_key: left_key,
                right_key: right_key,
                x: pos_x,
                y: pos_y,
                side: side,
                //force: generic.force,
                //stop_force: generic.stop_force,
                //friction: generic.friction,
                width: generic.width,
                height: generic.height,
                //max_speed: generic.max_speed,
                //bounciness: generic.bounciness,
                velocity_tolerance: generic.velocity_tolerance
            }
            
            // let paddle_obj = new Paddle(id, color, pos_x, pos_y, force, friction, width, height, left_key, right_key);
            let paddle_obj = new Paddle(paddle_obj_data);

            this.paddles.push(paddle_obj);
            
        }
    }
    
    async draw_init(draw_time = 2000) {
        let wait_time = draw_time / this.paddles.length;
        for (var paddle of this.paddles) {
            paddle.draw();
            await sleep(wait_time);
        }
    }

    draw() {
        for (var paddle of this.paddles) {
            paddle.draw();
        }
    }

    move(keys) {
        for (var paddle of this.paddles) {
            paddle.move(keys);
        }
    }

    check_collisions() {
        for (let paddle of this.paddles) {
            paddle.check_collisions();
        }
    }
}

