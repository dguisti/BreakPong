import { get_keys } from "../keyboard.js"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
}

class Hitbox {
}

class HitboxRect extends Hitbox {
    constructor(x1, y1, x2, y2) {
        super()
        this.x1 = Math.min(x1, x2);
        this.y1 = Math.min(y1, y2);
        this.x2 = Math.max(x1, x2);
        this.y2 = Math.max(y1, y2);
        this.speed = 0;
        this.speed_factor = 0.1;
    }
    
    colliding_point(x, y) {
        return x < this.x2 && x > this.x1 && y < this.y2 && y > this.y1;
    }

    move(dx, dy=0) {
        this.x1 += dx;
        this.x2 += dx;
        this.y1 += dy;
        this.y2 += dy;
        /*
        if (dx > 0) {
            this.speed = this.speed_factor
        } else if (dx < 0) {
            this.speed = -this.speed_factor
        }
        this.x1 += dx * this.speed + this.speed;
        this.x2 += dx * this.speed + this.speed;
        this.y1 += dy * this.speed + this.speed;
        this.y2 += dy * this.speed + this.speed;
        if (dx > 0) {
            this.speed += this.speed_factor * (this.speed ** 2);
        } else if (dx < 0) {
            this.speed -= this.speed_factor * (this.speed ** 2);
        } else {
            if (Math.abs(this.speed) < this.speed_factor) {
                this.speed = 0;
            } else {
                this.speed -= this.speed_factor * this.speed
            }
        }
        */
    }
}

/*
class HitboxCircle extends Hitbox {
    constructor(x, y, r) {
        super()
        this.x = x;
        this.y = y;
        this.r = r;
    }

    colliding_line(x1, y1, x2, y2) {
        let p1 = {
            x: x1,
            y: y2
        }

        let p2 = {
            x: x2,
            y: y2
        }

        var cx = this.x;
        var cy = this.y;

        let c = {
            x: cx,
            y: cy
        }
        
        let slope = (p2.y - p1.y) / (p2.x - p1.x)

        let x3 = (slope * slope * p1.x - slope * p1.y + slope * c.x + c.y) / (slope * slope + 1);
        let y3 = this.slope * (x3 - p1.x) + p1.y;

        let dist = distancePoints(x3, y3, c.x, c.y);

        return (dist <= this.circle.r);
        
    }

    /*colliding_line(x1, y1, x2, y2) {
        var closest_x = this.x < x1 ? x1 : (this.x > x2 ? x2 : this.x);
        var closest_y = this.y < y1 ? y1 : (this.y > y2 ? y2 : this.y);

        return distance(closest_x, closest_y, this.x, this.y) <= this.r;
    }

    colliding_HitboxRect(rect) {
        var top = this.colliding_line(rect.x1, rect.y1, rect.x2, rect.y1);
        var left = this.colliding_line(rect.x1, rect.y1, rect.x1, rect.y2) << 1;
        var bottom = this.colliding_line(rect.x1, rect.y2, rect.x2, rect.y2) << 2;
        var right = this.colliding_line(rect.x2, rect.y1, rect.x2, rect.y2) << 3;

        return top | left | bottom | right;
    }
}
*/


class Ball {
    constructor(x, y, radius, color = "white", dx = 0, dy = 0, speed = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
    }


    colliding_line(x1, y1, x2, y2) {
        let p1 = {
            x: x1,
            y: y1
        }

        let p2 = {
            x: x2,
            y: y2
        }

        var cx = this.x;
        var cy = this.y;

        let c = {
            x: cx,
            y: cy
        }

        
        // let slope = (Math.abs(p2.x - p1.x) > 0.00001) ? (p2.y - p1.y) / (p2.x - p1.x) : 999999999;

        var m = "Inf.";
        
        if (p2.x == p1.x) {
            var x3 = p1.x;
            var y3 = c.y;
        }
        else {
            m = (p2.y - p1.y) / (p2.x - p1.x);
    
            var x3 = (c.x + m * c.y + m ** 2 * p1.x - m * p1.y) / (m**2 + 1);
            var y3 = m * (x3 - p1.x) + p1.y;
        }

        //let x3 = (slope * slope * p1.x - slope * p1.y + slope * c.x + c.y) / (slope * slope + 1);
        //let y3 = slope * (x3 - p1.x) + p1.y;

        let dist = distance(x3, y3, c.x, c.y);

        if (dist <= this.radius) {
            //console.log("colliding...");
        }
        else {
            //console.log(`Not colliding (${dist} > ${this.radius})`);
        }

        ////console.log("not colliding...");
        //console.log(`Current distance is ${dist}`)
        //console.log(`p1.x=${p1.x}, p1.y=${p1.y}, p2.x=${p2.x}, p2.y=${p2.y}, c.x=${c.x}, c.y=${c.y}, x3=${x3}, y3=${y3}, slope=${m}`)

        if (dist <= this.radius) {
            if (x3 <= p2.x && x3 >= p1.x) {
                if (y3 <= p2.y && y3 >= p1.y) {
                    return true;
                }
            }
        }

        return false;
        
        //return (dist <= this.radius);
        
    }
    
    /*colliding_line(x1, y1, x2, y2) {
        var closest_x = this.x < x1 ? x1 : (this.x > x2 ? x2 : this.x);
        var closest_y = this.y < y1 ? y1 : (this.y > y2 ? y2 : this.y);

        return distance(closest_x, closest_y, this.x, this.y) <= this.radius ? [closest_x, closest_y] : [];
    }*/

    colliding_HitboxRect(rect) {
        ////console.log("top")
        var top = this.colliding_line(rect.x1, rect.y1, rect.x2, rect.y1);
        ////console.log("left")
        var left = this.colliding_line(rect.x1, rect.y1, rect.x1, rect.y2) << 1;
        //console.log("bottom")
        var bottom = this.colliding_line(rect.x1, rect.y2, rect.x2, rect.y2) << 2;
        //console.log("right")
        var right = this.colliding_line(rect.x2, rect.y1, rect.x2, rect.y2) << 3;
        //console.log("done", top, left, bottom, right)
        /*for (var side of [top, left, bottom, right]) {
            if (side.length > 0) {
                return side;
            }
        }
        */
        //return [];
        return top | left | bottom | right;
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

    move(bricks, paddles) {
        this.x += this.dx * this.speed
        this.y += this.dy * this.speed
        this.check_collisions(bricks, paddles)
    }

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
                var center_point = [brick.x + brick.width/2, brick.y + brick.height/2]
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
}


class BrickStruct {
    constructor(color, x, y, width, height, breakable=true) {
        this.color = color;
        this.breakable = breakable;
        this.broken = false;

        this.width = width;
        this.height = height;

        this.x = x;
        this.y = y;

        this.hitbox = new HitboxRect(x, y, x + width, y + height);
    }

    draw() {
        if (!this.broken) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }

    move(dx, dy=0) {
        this.x += dx;
        this.y += dy;
        this.hitbox.move(dx, dy)
    }

    destroy() {
        if (this.breakable) {
            this.broken = true;
        }
    }
}

class BrickStandard extends BrickStruct {
    constructor(color, x, y, width, height) {
        super(color, x, y, width, height, true);
    }
}

class BrickFactory {
    constructor(rows, columns, x, y, width, height, spacing = 5, brick = BrickStandard) {
        this.rows = rows;
        this.columns = columns;
        this.bricks = [];
        this.all_bricks = [];

        var current_x = x;
        var current_y = y;

        var brick_width = (width - spacing * (columns - 1)) / columns;
        var brick_height = (height - spacing * (rows - 1)) / rows;

        //console.log("Width:",width);
        //console.log("Height:",height);

        //console.log("Brick Width:",brick_width);
        //console.log("Brick Height:",brick_height);

        for (var i = 0; i < rows; i++) {
            this.bricks.push([]);
            var row = this.bricks[this.bricks.length - 1];
            current_x = x;
            for (var j = 0; j < columns; j++) {
                var current_brick = new brick("red", current_x, current_y, brick_width, brick_height)
                row.push(current_brick);
                this.all_bricks.push(current_brick)
                current_x += brick_width + spacing;
            }
            current_y += brick_height + spacing;
        }
    }

    async draw_init(before = () => { }, after = () => { }, draw_time = 2) {
        for (var row of this.bricks) {
            for (var brick of row) {
                before();
                brick.draw();
                after();
                await sleep(draw_time * 1000 / (this.rows * this.columns));
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


/*
canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.95;

ctx.canvas.width = canvas.width;
ctx.canvas.height = canvas.height;

bf = new BrickFactory(10, 10, 0, 0, ctx.canvas.width, ctx.canvas.height);
//console.log(bf.bricks);
bf.draw_init();
//bf.draw(););
//console.log(bf.bricks);
bf.draw_init();
//bf.draw
*/
