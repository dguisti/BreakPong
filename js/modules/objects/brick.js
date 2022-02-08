import { sleep } from "./util.js";
import { Config } from "./config.js";



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
                    colors[color_row], // `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
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