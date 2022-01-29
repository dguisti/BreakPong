import { sleep, clamp, distance } from "./util.js";
import { ctx } from "./canvas.js";
import { doc_width, doc_height } from "./window.js";
import { Config } from "./config.js";

class Ball {
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
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.last_hit = last_hit;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
    }

    move() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }

    destroy() {
        let death = new Event("death", { last_hit: this.last_hit });
        this.dispatchEvent(death);
    }

    hit_brick() {
        let hit = new Event("hit_brick", { last_hit: this.last_hit });
        this.dispatchEvent(hit);
    }

    // works but incomplete
    check_collisions(bricks, paddles, balls) {
        this.colliding_walls();
        //this.colliding_balls(balls);
        this.colliding_bricks(bricks);
        //this.colliding_paddles(paddles);
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
            this.destroy();
        }
        if (this.y - this.radius <= 0) {
            this.destroy();
        }
    }

    // works??? maybe???
    colliding_bricks(bricks) {
        for (let brick of bricks) {
            let collision_data = this.colliding_rect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );
            console.log(this.color, collision_data)
            if (collision_data.collided) {
                if (collision_data.top || collision_data.bottom) {
                    this.dy *= -1;
                }
                if (collision_data.right || collision_data.left) {
                    this.dx *= -1;
                }

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
            }
        }
    }

    colliding_balls(balls) {
        for (let ball of balls) {
            let dist = distance(this.x, this.y, ball.x, ball.y);
            if (dist < this.radius + ball.radius) {
                this.dx *= -1;
                this.dy *= -1;
            }
        }
    }

    colliding_line(x1, y1, x2, y2) {
        let p1 = { x: x1, y: y1 };

        let p2 = { x: x2, y: y2 };

        var cx = this.x;
        var cy = this.y;

        let c = { x: cx, y: cy };

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

        return dist <= this.radius;
    }

    colliding_rect(x, y, width, height) {
        var top = this.colliding_line(x, y, x + width, y + width);
        var left = this.colliding_line(x, y, x + width, y + height);
        var bottom = this.colliding_line(x, y, x + width, y + height);
        var right = this.colliding_line(x, y, x + width, y + height);

        return {
            top: top,
            left: left,
            bottom: bottom,
            right: right,
            collided: top || left || bottom || right,
        };
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

class Brick {
    constructor(color, x, y, width, height, breakable = true) {
        this.color = color;
        this.breakable = breakable;
        this.broken = false;

        this.width = width;
        this.height = height;

        this.x = x;
        this.y = y;

        //this.hitbox = new HitboxRect(x, y, x + width, y + height);
    }

    draw() {
        if (!this.broken) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }

    destroy() {
        if (this.breakable) {
            this.broken = true;
        }
    }
}

export class BrickFactory {
    constructor(
        rows,
        columns,
        x,
        y,
        width,
        height,
        colors = ["red"],
        spacing = 5,
        brick = Brick
    ) {
        this.rows = rows;
        this.columns = columns;
        this.bricks = [];
        this.all_bricks = [];

        var current_x = x;
        var current_y = y;

        var brick_width = (width - spacing * (columns - 1)) / columns;
        var brick_height = (height - spacing * (rows - 1)) / rows;

        for (var i = 0; i < rows; i++) {
            this.bricks.push([]);
            let row = this.bricks[this.bricks.length - 1];
            let color_row = i % colors.length;
            current_x = x;
            for (var j = 0; j < columns; j++) {
                var current_brick = new brick(
                    colors[color_row],
                    current_x,
                    current_y,
                    brick_width,
                    brick_height
                );
                row.push(current_brick);
                this.all_bricks.push(current_brick);
                current_x += brick_width + spacing;
            }
            current_y += brick_height + spacing;
        }
    }

    async draw_init(before = () => { }, after = () => { }, draw_time = 2000) {
        for (var row of this.bricks) {
            for (var brick of row) {
                before();
                brick.draw();
                after();
                await sleep(draw_time / (this.rows * this.columns));
                //console.log(`Sleeping for ${this.draw_time * 1000 / (this.rows * this.columns)}ms`);
            }
        }
    }

    draw() {
        for (var row of this.bricks) {
            for (var brick of row) {
                brick.draw();
            }
        }
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
            let other_balls = this.balls.slice().splice(i, 1);
            this.balls[i].check_collisions(bricks, paddles, other_balls);
        }
    }
}

export class PaddleFactory {
    paddles = [];
    async draw_init() {
        await sleep(1);
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
