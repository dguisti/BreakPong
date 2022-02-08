/*
BreakPong - game.js

Contains the game logic.

Dallin Guisti & Wil Kirkland
Last updated 1/28/2022
*/

// Necessary modules
import { canvas, fill_canvas, ctx } from "./canvas.js";
import { BallFactory } from "./objects/ball.js";
import { BrickFactory } from "./objects/brick.js";
import { PaddleFactory } from "./objects/paddle.js";
import { Config } from "./config.js";
import { Timer } from "./timer.js";
import { doc_width, doc_height } from "./window.js";
import { sleep, EventDispatch } from "./util.js";

var bf;
var pf;
var blf;
var scores;
var dispatcher;
var run_interval;

export function prep_game() {
    bf = new BrickFactory(Config.game.brick.rows, Config.game.brick.columns, 0, canvas.height / 3, canvas.width, canvas.height / 3, Config.game.brick.colors);
    pf = new PaddleFactory(Config.game.brick.rows, Config.game.brick.columns, 0, canvas.height / 3, canvas.width, canvas.height / 3, Config.game.brick.colors);
    blf = new BallFactory();
    EventDispatch.add_listeners("hit_brick", add_score);
    EventDispatch.add_listeners("hit_wall", reduct_score);
    scores = {"top": 1, "bottom": 1}
    if (Config.hacker.skip_countdown) {
        start_game();
        return;
    }
    fill_canvas("clear")
    game_countdown();
}

async function draw_timer(timer) {
    let timer_height = Config.game.countdown.timer_height;
    let time_dif = Config.game.countdown.time_dif;
    let timer_padding = Config.game.countdown.timer_padding;
    ctx.save();
    ctx.strokeStyle = Config.game.countdown.color;
    ctx.fillStyle = Config.main.background_color;
    ctx.font = `bold ${timer_height}px Copperplate`;
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    let txt = timer.text;
    if (timer.text == null) {
        txt = "GO!";
    }

    let largest_width = ctx.measureText("GO!").width;

    ctx.lineWidth = 5;
    ctx.strokeRect(doc_width / 2 - largest_width / 2 - timer_padding, doc_height / 2 - timer_height / 2 - timer_padding * 1, largest_width + timer_padding * 2, timer_height + timer_padding * 2);
    ctx.fillRect(doc_width / 2 - largest_width / 2 - timer_padding, doc_height / 2 - timer_height / 2 - timer_padding * 1, largest_width + timer_padding * 2, timer_height + timer_padding * 2);

    ctx.lineWidth = 1;
    ctx.strokeText(txt, doc_width / 2, doc_height / 2);

    ctx.restore();
}

async function game_countdown() {
    let timer = {
        text: "3",
    };

    let time_dif = Config.game.countdown.time_dif;

    for (const [text, wait_mult] of Config.game.countdown.values) {
        Timer.add_timer(function (text) {
            timer.text = text;
        }, time_dif * wait_mult, true, null, text);
    }

    bf.draw_init(() => { }, () => { draw_timer(timer) }, Config.game.brick_draw_time
    ).then(() => {
        console.log("Doing pf");
        pf.draw_init(1000)
            .then(() => {
                console.log("Doing blf");
                blf.draw_init(1000);
            })
    });

    while (timer.text != null) {
        draw_timer(timer);
        await sleep(1);
    }

    start_game();

}

function draw_all() {
    ctx.save();

    fill_canvas("clear");
    bf.draw();
    blf.draw()
    //pf.draw();
    /*
    paddle_bottom.draw();
    paddle_top.draw();
    ball_bottom.draw();
    ball_top.draw();*/

    ctx.restore();
}

function start_game() {
    console.log("starting");
    Timer.clear_timers();
    draw_all();
    run();
}

function run() {
    run_interval = setInterval(function () {

        /*
        paddle_bottom.move(paddle_bottom_dx);
        paddle_top.move(paddle_top_dx);

        paddle_top_dx -= Math.sign(paddle_top_dx) * Math.min(Math.abs(paddle_friction), Math.abs(paddle_top_dx));
        paddle_bottom_dx -= Math.sign(paddle_bottom_dx) * Math.min(Math.abs(paddle_friction), Math.abs(paddle_bottom_dx));
        */

        blf.check_collisions(bf.all_bricks, pf.paddles) //Ball Factory gives balls
        blf.move();


        draw_all();
    }, 10);
}

function add_score(hit_data) {
    let side = hit_data.last_hit;
    scores[side] += 1;
}

function reduct_score(hit_data) {
    let side = hit_data.wall_hit;
    console.log(side, hit_data)
    scores[side] -= 1;
    if (scores[side] < 1) {
        end_game(side);
    }
}

function end_game(losing_side) {
    return; //TEMP
    clearInterval(run_interval);
    alert(`Side ${losing_side} has lost! Points - Top: ${scores.top}, Bottom: ${scores.bottom}`);
    console.log(`Side ${losing_side} has lost! Points - Top: ${scores.top}, Bottom: ${scores.bottom}`);
}