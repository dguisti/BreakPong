import { sleep, clamp, distance } from "./util.js";
import { ctx } from "./canvas.js";
import { doc_width, doc_height } from "./window.js";
import { Config } from "./config.js";
import { Timer } from "./timer.js";
import { EventDispatch } from "./dispatch.js";

let MAX_BALL_D = distance(0, 0, Config.game.ball.dx[0], Config.game.ball.dy[0])

class Ball {
    static next_id = 0;
    constructor(
        x,
        y,
        radius,
        last_hit,
        color = "white",
        dx = 0,
        dy = 0,
        speed = 1
    ) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.last_hit = last_hit;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.collided_ball = false;
        this.destroyed = false;
        this.id = Ball.next_id;
        this.accel_factor = 1; //0.9; CONSIDER
        this.hit_change = 1; //1.2; CONSIDER
        Ball.next_id += 1;
    }

    move() {
        if (!this.destroyed) {
            this.collided_ball = false;
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;
            // CONSIDER
            if (this.accel_factor != 1) {
                if (distance(0, 0, this.dx, this.dy) > MAX_BALL_D) {
                    console.log(distance(0, 0, this.dx, this.dy));
                    this.dx *= this.accel_factor;
                    this.dy *= this.accel_factor;
                }
            }
        }
    }

    destroy(wall) {
        console.log("Ball of color", this.color, "destroyed.")
        // Begin death
        this.destroyed = true;
        let current_color = this.color;
        // clear after some time
        for (let i = 0; i < Config.game.ball.death_flashes; i += 2) {
            Timer.add_timer(() => {
                this.color = Config.game.ball.death_color;
            }, i*Config.game.ball.death_color_time);
            Timer.add_timer(() => {
                this.color = "transparent";
            }, (i+1)*Config.game.ball.death_color_time);
        }

        Timer.add_timer(() => {
            if (wall == "top") {
                // Hit top wall, respawn at top
                this.x = doc_width / 2;
                this.y = doc_height / 6;
                this.dx = Config.game.ball.dx[1]
                this.dy = Config.game.ball.dy[1]
                console.log(`Set to x=${this.x}, y=${this.y}, dx=${this.dx}, dy=${this.dy}`)
                
            } else {
                // Hit the bottom wall, respawn at bottom
                this.x = doc_width / 2;
                this.y = (5 * doc_height) / 6;
                this.dx = Config.game.ball.dx[0]
                this.dy = Config.game.ball.dy[0]
                console.log(`Set to x=${this.x}, y=${this.y}, dx=${this.dx}, dy=${this.dy}`)
            }
            this.destroyed = false;
            this.color = current_color;

        }, Config.game.ball.death_wait_time - Config.game.ball.death_flashes * Config.game.ball.death_color_time);

        let death = new EventDispatch("hit_wall", { wall_hit: wall, ball_id: this.id, color: this.color })
    }

    hit_brick() {
        let hit = new EventDispatch("hit_brick", { last_hit: this.last_hit });
    }

    // works but incomplete
    check_collisions(bricks, paddles, balls) {
        if (!this.destroyed) {
            this.colliding_walls();
            this.colliding_balls(balls);
            this.colliding_bricks(bricks);
            //this.colliding_paddles(paddles);
        }
    }

    // works??? maybe???
    colliding_walls() {
        if (this.x + this.radius >= doc_width) {
            this.dx = -this.dx;
        }
        if (this.x - this.radius <= 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius >= doc_height) {
            //this.dy = -this.dy; // TEMPORARY WHILE BALLS ARE BROKEN
            this.destroy("bottom");
        }
        if (this.y - this.radius <= 0) {
            //this.dy = -this.dy; // TEMPORARY WHILE BALLS ARE BROKEN
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
                if (collision_data.top || collision_data.bottom) {
                    this.dy *= -1;
                }
                if (collision_data.right || collision_data.left) {
                    this.dx *= -1;
                }

                this.add_noise();
                
                brick.destroy();
                this.hit_brick();
            }
        }
    }

    // doesnt work
    colliding_paddles(paddles) {
        for (let paddle of paddles) {
            let collision_data = this.colliding_rect(
                paddle.x,
                paddle.y,
                paddle.width,
                paddle.height
            );
            if (collision_data.collided) {
                if (collision_data.top || collision_data.bottom) {
                    this.dy *= -1;
                }
                if (collision_data.right || collision_data.left) {
                    this.dx *= -1;
                }

                this.last_hit = paddle.name;

                this.add_noise();
                
            }
        }
    }

    colliding_balls(balls) {
        let r1 = this.radius
        for (let ball of balls) {
            if (ball.destroyed) {
                continue;
            }
            let r2 = ball.radius
            let dist = distance(this.x, this.y, ball.x, ball.y);
            if ((dist < r1 + r2) && !ball.collided_ball) {
                this.collided_ball = true;
                ball.collided_ball = true;
                console.log(MAX_BALL_D)
                console.log("Start dist: ", distance(0, 0, this.dx, this.dy))
                this.dx = MAX_BALL_D*(this.x - ball.x)/dist // * this.hit_change CONSIDER   //* Math.abs(this.dx);
                this.dy = MAX_BALL_D*(this.y - ball.y)/dist // * this.hit_change CONSIDER   //* Math.abs(this.dy);
                console.log("Ending dist: ", distance(0, 0, this.dx, this.dy))
                ball.dx = MAX_BALL_D*(ball.x - this.x)/dist // * this.hit_change CONSIDER   //* Math.abs(ball.dx);
                ball.dy = MAX_BALL_D*(ball.y - this.y)/dist // * this.hit_change CONSIDER   //* Math.abs(ball.dy);
                
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

        if (side == "top") {
            if (c.y > closest_y) return false
        } else if (side == "bottom") {
            if (c.y < closest_y) return false
        } else if (side == "left") {
            if (c.x > closest_x || this.dx < 0) return false
        } else if (side == "right") {
            if (c.x < closest_x || this.dx > 0) return false
        }
        
        return dist <= this.radius;
    }

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
            collided: top || left || bottom || right,
        };
    }

    add_noise() {
        // Randomize motion
        let theta = Math.atan(this.dy/this.dx);
        theta = (this.dx >= 0) ? theta : theta + Math.PI;

        let magnitude = distance(0, 0, this.dx, this.dy);

        let delta_theta = Config.game.ball.random_rotation * (Math.random() * 2 - 1);

        let theta_new = theta + delta_theta;

        // console.log(`Old dx: ${this.dx} Old dy: ${this.dy}`);
        
        this.dx = magnitude * Math.cos(theta_new);
        this.dy = magnitude * Math.sin(theta_new);

        // console.log(`New dx: ${this.dx} New dy: ${this.dy}`);
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
    constructor(
        points = [
            [doc_width / 2, (5 * doc_height) / 6],
            [doc_width / 2, doc_height / 6],
        ],
        radius = Config.game.ball.radius,
        color = Config.game.ball.colors,
        dx = Config.game.ball.dx,
        dy = Config.game.ball.dy,
        speed = Config.game.ball.speed,
        last_hit = ["bottom", "top"]
    ) {
        this.points = points;
        this.radius = radius;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.last_hit = last_hit;
        console.log("Creating balls");
        this.balls = this.create_balls();
    }

    create_ball(x, y, radius, last_hit, color, dx = 0, dy = 0, speed = 1) {
        return new Ball(x, y, radius, last_hit, color, dx, dy, speed);
    }

    create_balls() {
        let balls = [];
        let count = Math.min(
            this.points.length,
            this.radius.length,
            this.last_hit.length,
            this.color.length,
            this.dx.length,
            this.dy.length,
            this.speed.length
        );
        for (var i = 0; i < count; i++) {
            balls.push(
                this.create_ball(
                    this.points[i][0],
                    this.points[i][1],
                    this.radius[i],
                    this.last_hit[i],
                    this.color[i],
                    this.dx[i],
                    this.dy[i],
                    this.speed[i]
                )
            );
        }
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
                        this.dy *= -1;
                    }
                    if (collide_edges & dirs.left || collide_edges & dirs.right) {
                        this.dx *= -1;
                    }
                } else {
                    var angle = Math.atan2(this.y - center_point[1], this.x - center_point[0]);
                    console.log("Bounce")
                    //console.log("angle=", angle, " brick=", brick, " center=", center_point)
                    // Calculate the new speed of the ball
                    this.dx = Math.cos(angle) //* this.speed;
                    this.dy = Math.sin(angle) //* this.speed;
                }


                //this.dx = -this.dx;
                //this.dy = -this.dy;
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