import { canvas, ctx } from "./canvas.js";
import { doc_width, doc_height } from "./window.js";
import { EventDispatch } from "./util.js";
import { Config } from "./config.js";


export class GameScore {
    constructor(end_game, ...sides) {
        this.end = end_game;
        this.scores = {};
        this.colors = {};
        for (let side of sides) {
            this.scores[side.side] = Config.game.start_score;
            this.colors[side.side] = side.color;
        }
        
        EventDispatch.add_listeners("hit_brick", (hit_data) => {this.increment_score(hit_data.last_hit)});
        EventDispatch.add_listeners("hit_wall", (hit_data) => {this.decrement_score(hit_data.wall_hit)});
    }

    increment_score(side) {
        this.scores[side] += Config.game.brick_score;
    }

    decrement_score(side) {
        //console.log(this.scores)
        this.scores[side] -= Config.game.death_score;
        if (this.scores[side] < 1) { // Maybe change but probably not necessary
            this.scores[side] = 0
            this.end(this.scores, side);
        }
    }

    draw() {
        // Only for sides "top" and "bottom"
        for (let side of ["top", "bottom"]) {
            let current_score = this.scores[side]
            ctx.save()
            
            let spacing = Config.game.score.wall_spacing
            let score_rad_outer = Config.game.score.rad_outer;
            let score_rad_inner = Config.game.score.rad_inner;
            let max_score = this.scores["top"] + this.scores["bottom"];
            let score_x = doc_width - score_rad_outer - spacing;
            if (side == "top") {
                var score_y = 0 + score_rad_outer + spacing
            } else {
                var score_y = doc_height - score_rad_outer - spacing
            }
            
            ctx.beginPath();
            ctx.fillStyle = Config.game.score.no_points_color;//Config.game.main.background_color; //blank_color;
            ctx.arc(score_x, score_y, score_rad_outer, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = this.colors[side] //Config.game.score.fill_color; //filled_color;
            ctx.arc(score_x, score_y, score_rad_outer, 0 - Math.PI/2, (current_score / max_score) * 2*Math.PI - Math.PI/2);
            ctx.lineTo(score_x, score_y);
            ctx.lineTo(score_x, score_y - score_rad_outer);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = Config.game.score.inner_color;//background_color;
            ctx.arc(score_x, score_y, score_rad_inner, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
            let size = Config.game.score.max_font_size;
            ctx.font = `${size}px `+Config.game.score.font;
            let max_size = ctx.measureText("9").width;
            if (ctx.measureText(current_score).width > max_size){
                size -= 5
                ctx.font = `${size}px `+Config.game.score.font;
            }
            ctx.strokeStyle = Config.game.score.text_color;
            ctx.textAlign = "center";
            ctx.textBaseline = "ideographic";
            ctx.strokeText(current_score, score_x, score_y+size/2);
            ctx.restore();

        }
    }
}