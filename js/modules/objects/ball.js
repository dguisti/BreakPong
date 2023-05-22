import { sleep, clamp, distance, EventDispatch } from "../util.js";
import { ctx } from "../canvas.js";
import { doc_width, doc_height } from "../window.js";
import { Config } from "../config.js";
import { Timer } from "../timer.js";

let center_x_pos =  1/2 * doc_width;
let top_pos = 1/6 * doc_height;
let bottom_pos = 5/6 * doc_height;

class Ball {
    constructor(data) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.radius = data.radius;
        this.last_hit = data.side;
        this.color = data.color;
        this.vx = data.vx;
        this.vy = data.vy;
        
        this.base_speed = data.base_speed;
        
        this.collided_ball = false;
        this.destroyed = false;

        this.death_tolerence = 30;
        this.wall_tolerence = 1;
        this.accel_factor = 0.1;
        
    }

    move() {
        this.collided_ball = false;
        if (!this.destroyed) {
            this.x += this.vx * this.base_speed * Config.game.ball.generic.speed_mult;
            this.y += this.vy * this.base_speed * Config.game.ball.generic.speed_mult;
            
            if (this.accel_factor != 1) {
                if (distance(0, 0, this.vx, this.vy) > Config.game.ball.generic.max_speed) {
                    //console.log(distance(0, 0, this.vx, this.vy));
                    this.vx -= Math.sign(this.vx) * this.accel_factor;
                    //x = vx * t + 1/2at^2
                    
                    //this.vy -= Math.sign(this.vy) * this.accel_factor;
                }
            } 
        }
    }

    destroy(wall) {
        //console.log("Ball of color", this.color, "destroyed.")
        // Begin death
        this.destroyed = true;
        let current_color = this.color
        if (wall == "top") {
            // Top color
            current_color = Config.game.paddle.paddles[0].color
        } else {
            // Bottom color
            current_color = Config.game.paddle.paddles[1].color
        }


        let initial_wait = Config.game.ball.generic.death_wait_time - Config.game.ball.generic.death_flashes * Config.game.ball.generic.death_color_time;
        let i = 0;
        
        
        Timer.add_timer(() => {
            // Move x and y after initial wait
            if (wall == "top") {
                this.x = Config.game.ball.balls[1].position.x;
                this.y = Config.game.ball.balls[1].position.y;
            } else {
                this.x = Config.game.ball.balls[0].position.x;
                this.y = Config.game.ball.balls[0].position.y;
            }
            if (this.x == "center") this.x = center_x_pos;
            if (this.y == "top") this.y = top_pos;
            if (this.y == "bottom") this.y = bottom_pos;
        }, initial_wait)

        // clear after some time
        for (i = 0; i < Config.game.ball.generic.death_flashes*2; i += 2) {
            // Primary transparent flash
            Timer.add_timer(() => {
                this.color = "transparent";
            }, initial_wait + (i) * Config.game.ball.generic.death_color_time/2);
            // Secondary color flash
            Timer.add_timer(() => {
                this.color = current_color;//Config.game.ball.generic.death_color;
            }, initial_wait + (i+1) * Config.game.ball.generic.death_color_time/2);
        }

        
        // Reset ball with velocity
        Timer.add_timer(() => {
            if (wall == "top") {
                // Hit top wall, respawn at top
                this.vx = Config.game.ball.balls[1].velocity.vx;
                this.vy = Config.game.ball.balls[1].velocity.vy;
                //console.log(`Set to x=${this.x}, y=${this.y}, vx=${this.vx}, vy=${this.vy}`)
                
            } else {
                this.vx = Config.game.ball.balls[0].velocity.vx;
                this.vy = Config.game.ball.balls[0].velocity.vy;
                //console.log(`Set to x=${this.x}, y=${this.y}, vx=${this.vx}, vy=${this.vy}`)
            }
            this.destroyed = false;
            this.color = current_color;
            //console.log("Respawned with", this.color, this)

        }, Config.game.ball.generic.death_wait_time);

        // Broadcast death for listeners
        let death = new EventDispatch("hit_wall", { wall_hit: wall, ball_id: this.id, color: this.color })
    }

    hit_brick() {
        let hit = new EventDispatch("hit_brick", { last_hit: this.last_hit });
    }

    check_collisions(bricks, paddles, balls) {
        if (!this.destroyed) {
            this.colliding_walls();
            this.colliding_bricks(bricks);
            this.colliding_balls(balls);
            this.colliding_paddles(paddles);
        }
    }

    colliding_walls() {
        // Right Wall
        if (this.x + (this.radius) >= doc_width) {
            this.vx = -Math.abs(this.vx);
            //this.x = doc_width - (this.radius + this.wall_tolerance)
        }
        // Left Wall
        if (this.x - (this.radius) <= 0) {
            this.vx = Math.abs(this.vx);
            //this.x = 0 + (this.radius + this.wall_tolerance)
        }
        
        // Top Wall
        if (this.y - this.radius >= doc_height) { //this.y + (this.radius - this.death_tolerence)
            //this.vy = -this.vy; // TEMPORARY WHILE BALLS ARE BROKEN
            // Make ball go off screen
            //this.y = doc_height + Math.abs(this.radius - this.death_tolerence);
            // CONSIDER: shifting x to make it move back in a straight line. But also, already looks weird so...
            this.destroy("bottom");
        }
        // Bottom Wall
        if (this.y + this.radius <= 0) { // this.y - (this.radius - this.death_tolerence)
            //this.vy = -this.vy; // TEMPORARY WHILE BALLS ARE BROKEN
            // Make ball go off screen
            //this.y = 0 - Math.abs(this.radius - this.death_tolerence);
            this.destroy("top");
        }
    }

    // works??? maybe???
    colliding_bricks(bricks) {
        for (let brick of bricks) {
            if (brick.broken) {
                continue;
            }
            let collision_data = this.colliding_rect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );
            if (collision_data.collided) {
                if (collision_data.top > 0 || collision_data.bottom > 0) {
                    this.vy *= -1;
                }
                if (collision_data.right > 0 || collision_data.left > 0) {
                    this.vx *= -1;
                }
                //if (!collision_data.inside) {
                this.add_noise();
                
                brick.destroy();
                this.hit_brick();
                //}
            }
        }
    }

    // doesnt work
    colliding_paddles(paddles) {
        let paddle_edge_tolerance = 1
        for (let paddle of paddles) {
            let collision_data = this.colliding_rect(
                paddle.x,
                paddle.y,
                paddle.width,
                paddle.height
            );
            if (collision_data.collided) {
                /*
                if (collision_data.top == 1 || collision_data.bottom == 1) {
                    //fix
                    this.vy *= -Math.abs(this.vy);
                }
                */
                if (collision_data.right == 1 || collision_data.left == 1) {
                    // Hitting left or right, not inside
                    //console.log("Hit left or right, maybe also top")
                    //this.vx *= -1
                    // ignoring for now this.vx = -Math.sign(this.vx) * Math.max(Math.abs(this.vx), Math.abs(paddle.vx))
                    //this.vy *= -1
                } else if (collision_data.right == 2){
                    // Hitting right, inside
                    //console.log("Inside right")
                    // let edge = paddle.x + paddle.width + this.radius + paddle_edge_tolerance
                    //if (this.x < edge)
                    // if (Math.abs(this.y - paddle.y) >= paddle.width/2)
                    //     this.x = edge;
                    //console.log(this.id, this.x);
                    this.vx = Math.sign(paddle.vx) * Math.max(Math.abs(this.vx), Math.abs(paddle.vx))
                } else if (collision_data.left == 2) {
                    // Hitting left, inside
                    //console.log("Inside left")
                    // let edge = paddle.x - this.radius - paddle_edge_tolerance;
                    // if (Math.abs(this.y - paddle.y) >= paddle.width/2)
                    //     this.x = edge;
                    //console.log(this.id, this.x);
                    this.vx = Math.sign(paddle.vx) * Math.max(Math.abs(this.vx), Math.abs(paddle.vx))
                }

                if (!collision_data.inside) {
                    //console.log("Hitting paddle!", this.id, collision_data)
                }
                if (!this.destroyed) {
                    this.last_hit = paddle.side;
                    this.color = paddle.color;
                }

                if (paddle.side == "top") {
                    this.vy = Math.abs(this.vy);
                    this.vx += paddle.vx * Config.game.paddle.generic.bounce_friction;
                    //this.y = paddle.y + paddle.height + this.wall_tolerance
                } else {
                    this.vy = -Math.abs(this.vy);
                    this.vx += paddle.vx * Config.game.paddle.generic.bounce_friction;
                    //this.y = paddle.y - (paddle.height + this.wall_tolerance)
                }

                this.add_noise();
                /*
                    if (collision_data.right && !(collision_data.top || collision_data.bottom)) {
                            console.log("RIGHT NO TOP BOTTOM")
                            let edge = paddle.x + paddle.width + this.radius
                            if (this.x < edge) this.x = edge
                            this.vy *= -.02
                        }
                        if (collision_data.left && !(collision_data.top || collision_data.bottom)) {
                            console.log("LEFT NO TOP BOTTOM")
                            let edge = paddle.x - paddle.vx - this.radius
                            if (this.x > edge) this.x = edge
                            this.vy *= -.02
                        }
                */ 
            }
        }
    }

    colliding_balls(balls) {
        // Associated Desmos Graph: https://www.desmos.com/calculator/lbzbbsc1dk
        let r1 = this.radius;
        let true_speed = distance(0, 0, this.vx, this.vy);
        for (let ball of balls) {
            if (ball.destroyed || this.destroyed) {
                continue;
            }
            let r2 = ball.radius
            let dist = distance(this.x, this.y, ball.x, ball.y);
            if ((dist < r1 + r2) && !ball.collided_ball) {
                this.collided_ball = true;
                ball.collided_ball = true;
                if (!dist) {
                    this.vx *= -1;
                    this.vy *= -1;
                    return;
                };
                let ball_true_speed = distance(0, 0, ball.vx, ball.vy)
                //console.log(MAX_BALL_D);
                //console.log("Start dist: ", distance(0, 0, this.vx, this.vy));
                this.vx = ball_true_speed*(this.x - ball.x)/dist; // * this.hit_change CONSIDER   //* Math.abs(this.vx);
                this.vy = ball_true_speed*(this.y - ball.y)/dist; // * this.hit_change CONSIDER   //* Math.abs(this.vy);
                //console.log(`vx: ${this.vx}, vy: ${this.vy}, Ballx: ${ball.vx}, Bally: ${ball.vy}`);
                //console.log("Ending dist: ", distance(0, 0, this.vx, this.vy));
                ball.vx = true_speed*(ball.x - this.x)/dist; // * this.hit_change CONSIDER   //* Math.abs(ball.vx);
                ball.vy = true_speed*(ball.y - this.y)/dist; // * this.hit_change CONSIDER   //* Math.abs(ball.vy);
                
                this.add_noise();
            }
        }
    }

    colliding_line(x1, y1, x2, y2, side="") {
        let p1 = { x: x1, y: y1 };

        let p2 = { x: x2, y: y2 };

        let c = { x: this.x, y: this.y };

        let possible_x = c.x;
        let possible_y = c.y;

        if (p2.x != p1.x) {
            let m = (p2.y - p1.y) / (p2.x - p1.x);
            possible_x = (c.x + m * c.y + m ** 2 * p1.x - m * p1.y) / (m ** 2 + 1);
            possible_y = m * (possible_x - p1.x) + p1.y;
        }

        // Adjust x value based on if the slope is infinity. Default to p1.x
        let adjusted_x = p1.x == p2.x ? p1.x : possible_x;

        let closest_x = clamp(
            adjusted_x,
            Math.min(p1.x, p2.x),
            Math.max(p1.x, p2.x)
        );

        let adjusted_y = p1.y == p2.y ? p1.y : possible_y;

        let closest_y = clamp(
            adjusted_y,
            Math.min(p1.y, p2.y),
            Math.max(p1.y, p2.y)
        );

        let dist = distance(closest_x, closest_y, c.x, c.y);

        let return_num = 1;

        
        if (side == "top") {
            if (c.y > closest_y) return 0;
            else if (this.vy < 0) return_num = 2;
        } else if (side == "bottom") {
            if (c.y < closest_y) return 0;
            else if (this.vy > 0) return_num = 2;
        } else if (side == "left") {
            if (c.x > closest_x) return 0;
            else if (this.vx < 0) return_num = 2;
        } else if (side == "right") {
            if (c.x < closest_x) return 0;
            else if (this.vx > 0) return_num = 2;
        }
        
        return dist <= this.radius ? return_num : 0;
    }

    /*
    colliding_rect(x, y, width, height) {
        var top = this.colliding_line(x, y, x + width, y, "top");
        var left = this.colliding_line(x, y, x, y + height, "left");
        var bottom = this.colliding_line(x, y + height, x + width, y + height, "bottom");
        var right = this.colliding_line(x + width, y, x + width, y + height, "right");


        return {
            top: top,
            left: left,
            bottom: bottom,
            right: right,
            collided: top != 0 || left != 0 || bottom != 0 || right != 0,
            inside: top == 2 || left == 2 || bottom == 2 || right == 2,
        };
    }
*/
    colliding_rect(x, y, width, height) {
        // X, Y is top left
        let dist_x = Math.abs(this.x - x - width/2);
        let dist_y = Math.abs(this.y - y - height/2);


        let result = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            collided: 0
        }

        if (dist_x > (width/2 + this.radius)) {
            // Too far for any collision in x direction
            return result;
        }
        if (dist_y > (height/2 + this.radius)) {
            // Too far for any collision in y direction
            return result;
        }
        if (dist_x <= width/2) {
            result.top = (this.y - y - height/2 < 0);
            result.bottom = (this.y - y - height/2 > 0);
            result.collided = 1;
            console.log("Hitting height/2 left =", result.left, "right =", result.right, "top =", result.top, "bottom =", result.bottom);
            return result;
        }
        if (dist_y <= height/2) {
            result.left = 2*(this.x - x - width/2 < 0);
            result.right = 2*(this.x - x - width/2 > 0);
            result.collided = 1;
            console.log("Hitting height/2 left =", result.left, "right =", result.right);
            return result;
        }
        
        let dx = dist_x - width/2
        let dy = dist_y - height/2

        if (dx**2 + dy**2 <= this.radius**2) {
            // Pythagorian for corner
            result.top = (this.y - y - height/2 < 0);
            result.bottom = (this.y - y - height/2 > 0);
            result.left = (this.x - x - width/2 < 0);
            result.right = (this.x - x - width/2 > 0);
            result.collided = 1;
            console.log("Hitting corner? left =", result.left, "right =", result.right, "top =", result.top, "bottom =", result.bottom);
        }
        return result;
    }

    add_noise() {
        // Randomize motion
        let theta = Math.atan(this.vy/this.vx);
        theta = (this.vx >= 0) ? theta : theta + Math.PI;

        let magnitude = distance(0, 0, this.vx, this.vy);

        let delta_theta = Config.game.ball.generic.random_rotation * (Math.random() * 2 - 1);

        let theta_new = theta + delta_theta;

        // console.log(`Old vx: ${this.vx} Old vy: ${this.vy}`);
        
        this.vx = magnitude * Math.cos(theta_new);
        this.vy = magnitude * Math.sin(theta_new);

        // console.log(`New vx: ${this.vx} New vy: ${this.vy}`);
    }

    draw() {
        // Draw the ball
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}




export class BallFactory {
    // BallFactory class that keeps track of and creates balls
    constructor(generic, ball_data) {
        console.log("Creating balls");
        this.balls = this.create_balls(generic, ball_data);
    }

    create_balls(generic, ball_data) {
        let balls = [];
        for (const [id, ball] of ball_data.entries()) {
            let pos_x = ball.position.x;
            if (ball.position.x == "center") pos_x = center_x_pos;
            
            let pos_y = ball.position.y;
            if (ball.position.y == "top") pos_y = top_pos;
            if (ball.position.y == "bottom") pos_y = bottom_pos;
            
            let ball_obj_data = {
                id: id,
                x: pos_x,
                y: pos_y,
                radius: ball.radius,
                side: ball.position.side,
                color: ball.color,
                vx: ball.velocity.vx,
                vy: ball.velocity.vy,
                base_speed: generic.base_speed
            }

            let ball_obj = new Ball(ball_obj_data);
            balls.push(ball_obj);
        }
        /*
        let count = ball_config.length;
        for (var i = 0; i < count; i++) {
            balls.push(
                this.create_ball(
                    x: ball.position.x,
                    y: ball.position.y,
                    radius: ball.radius,
                    side: ball.position.side,
                    color: ball.color,
                    vx: ball.velocity.vx,
                    vy: ball.velocity.vy,
                    speed: ball_data[i].velocity.speed
                )
            );
        }*/
        return balls;
    }

    // Draw balls in order of greatest y coordinate to least
    async draw_init(draw_time = 1000) {
        this.balls.sort((a, b) => {
            return a.y - b.y;
        });
        for (let ball of this.balls) {
            ball.draw();
            await sleep(draw_time / this.balls.length);
        }
    }

    draw() {
        for (let ball of this.balls) {
            ball.draw();
        }
    }

    move() {
        for (let ball of this.balls) {
            ball.move();
        }
    }

    check_collisions(bricks, paddles) {
        for (let i = 0; i < this.balls.length; i++) {
            let other_balls = this.balls.slice()
            other_balls.splice(i, 1);
            this.balls[i].check_collisions(bricks, paddles, other_balls);
        }
    }
}




// ball1.addEventListener("death", (last_hit) => { });

/*

check_collisions(bricks, paddles) {
        var dirs = {
            top: 1,
            left: 2,
            bottom: 4,
            right: 8
        }
        for (var brick of [...bricks, ...paddles]) {
            var collide_edges = this.colliding_HitboxRect(brick.hitbox);
            if (collide_edges) { //.length > 0
                var center_point = [brick.x + brick.width / 2, brick.y + brick.height / 2]
                //console.log("COLLIDED!");

                brick.destroy();

                if (brick.breakable) {
                    bricks.splice(bricks.indexOf(brick), 1);
                    if (collide_edges & dirs.top || collide_edges & dirs.bottom) {
                        this.vy *= -1;
                    }
                    if (collide_edges & dirs.left || collide_edges & dirs.right) {
                        this.vx *= -1;
                    }
                } else {
                    var angle = Math.atan2(this.y - center_point[1], this.x - center_point[0]);
                    console.log("Bounce")
                    //console.log("angle=", angle, " brick=", brick, " center=", center_point)
                    // Calculate the new speed of the ball
                    this.vx = Math.cos(angle) //* this.speed;
                    this.vy = Math.sin(angle) //* this.speed;
                }


                //this.vx = -this.vx;
                //this.vy = -this.vy;
            }
        }
    }




possible_x = (c.x + m * c.y + m ** 2 * p1.x - m * p1.y) / (m ** 2 + 1);

// Adjust x value based on if the slope is infinity. Default to p1.x
adjusted_x = p1.x == p2.x ? p1.x : possible_x

closest_x = clamp(adjusted_x, Math.min(p1.x, p2.x), Math.max(p1.x, p2.x))
// closest_x = adjusted_x > Math.max(p2.x, p1.x) ? Math.max(p2.x, p1.x) : ( adjusted_x < Math.min(p2.x, p1.x) ? Math.min(p2.x,p1.x) : adjusted_x} )


possible_y = m * (x3 - p1.x) + p1.y;

adjusted_y = p1.y == p2.y ? p1.y : possible_y

closest_y = clamp(adjusted_y, Math.min(p1.y, p2.y), Math.max(p1.y, p2.y))

//closest_y = {i_{ys}>max(p_{2}.y,p_{1}.y):max(p_{2}.y,p_{1}.y),i_{ys}<min(p_{2}.y,p_{1}.y):min(p_{2}.y,p_{1}.y),p_{1}.x=p_{2}.x:c.y,i_{ys}}

*/