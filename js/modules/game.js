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
import { sleep, randint } from "./util.js";
import { GameScore } from "./score.js"
import { get_keys } from "./keyboard.js";

var bf;
var pf;
var blf;
var score;
var run_interval;
var difficulty_interval;
var difficulty_counter = 0;
var difficulty_text_timer = 0;
var difficulty_time = 1500/(Config.game.difficulty);
console.log("Initial dif time:", difficulty_time);

export function prep_game() {
    bf = new BrickFactory(Config.game.brick.rows, Config.game.brick.columns, 0, canvas.height / 3, canvas.width, canvas.height / 3, Config.game.brick.colors);
    pf = new PaddleFactory(Config.game.paddle.generic, Config.game.paddle.paddles);
    blf = new BallFactory(Config.game.ball.generic, Config.game.ball.balls);
    score = new GameScore(end_game, {side: Config.game.paddle.paddles[0].side, color: Config.game.paddle.paddles[0].color}, {side: Config.game.paddle.paddles[1].side, color: Config.game.paddle.paddles[1].color});
    if (Config.hacker.skip_countdown) {
        start_game();
        return;
    }
    fill_canvas("clear")
    difficulty_time = 1500/(Config.game.difficulty);
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
    blf.draw();
    pf.draw();
    score.draw();

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
        
        blf.move();
        pf.move(get_keys());
        blf.check_collisions(bf.all_bricks, pf.paddles) //Ball Factory gives balls
        pf.check_collisions(); // wall collisions
        draw_all();
        difficulty_counter++;
        if (difficulty_counter >= difficulty_time) {
            console.log(difficulty_time)
            increase_difficulty();
            difficulty_counter = 0;
            difficulty_text_timer = difficulty_time/3;
            if (difficulty_time > 100) difficulty_time -= 10;
        }
        if (difficulty_text_timer > 0) {
            difficulty_text_timer--;
            ctx.save();
            ctx.strokeColor = Config.game.difficulty_text_color
            ctx.textAlign = "center";
            ctx.textBaseline = 'ideographic';
            ctx.font = `bold ${Config.game.difficulty_text_size}px Copperplate Gothic`
            ctx.fillStyle = Config.main.background_color;
            ctx.fillText("INSTABILITY INCREASED", doc_width * 5/6, doc_height/2 + Config.game.difficulty_text_size/2)
            ctx.strokeText("INSTABILITY INCREASED", doc_width * 5/6, doc_height/2 + Config.game.difficulty_text_size/2)
            ctx.restore();
        }
    }, 10);
}

function increase_difficulty() {
    /*
    
    */
    console.log("Increasing diff")
    let unsuccessful = true;
    let generic_factor = 1.1
    while (unsuccessful) {
        switch(randint(1, 12)) {
            case 1:
                // Ball Base Speed
                Config.game.ball.generic.speed_mult *= generic_factor
                console.log("Ball base speed increased!")
                unsuccessful = false;
                break;
            case 2:
                // Ball Max Speed
                Config.game.ball.generic.max_speed *= generic_factor
                console.log("Ball max speed increased!")
                unsuccessful = false;
                break;
            case 3:
                // Death Wait Time
                if (Config.game.ball.generic.death_wait_time > 500) {
                    Config.game.ball.generic.death_wait_time -= 500
                    Config.game.ball.generic.death_flashes -= 1
                    console.log("Death time decreased!")
                    unsuccessful = false;
                }
                break;
            case 4:
                // Brick Score
                if (Config.game.brick_score > 1) {
                    Config.game.brick_score -= 1
                    console.log("Brick score decreased!")
                    unsuccessful = false;
                }
                break;
            case 5:
                // Death Score
                Config.game.death_score += 1
                console.log("Points lost on death increased!")
                unsuccessful = false;
                break;
            case 6:
                // Paddle Max Speed
                Config.game.paddle.generic.max_speed *= generic_factor
                console.log("Paddle max speed increased!")
                unsuccessful = false;
                break;
            case 7:
                // Paddle force
                Config.game.paddle.generic.force *= generic_factor
                console.log("Paddle force increased!")
                unsuccessful = false;
                break;
            case 8:
                // Paddle stop force
                Config.game.paddle.generic.stop_force /= generic_factor
                console.log("Paddle stop force decreased!")
                unsuccessful = false;
                break;
            case 9:
                // Paddle (own) friction
                Config.game.paddle.generic.friction /= generic_factor
                console.log("Paddle movement friction decreased!")
                unsuccessful = false;
                break;
            case 10:
                // Paddle bounciness
                Config.game.paddle.generic.bounciness *= generic_factor
                console.log("Paddle bounciness increased!")
                unsuccessful = false;
                break;
            case 11:
                // Paddle bounce friction
                Config.game.paddle.generic.bounce_friction *= generic_factor
                console.log("Paddle bounce friction increased!")
                unsuccessful = false;
                break;
            case 12: 
                // Do nothing
                console.log("No increased difficulty!")
                unsuccessful = false;
                break;
        }
    }
}

async function end_game(scores, losing_side) {
    draw_all();
    clearInterval(run_interval);
    clearInterval(difficulty_interval);
    await sleep(2000)
    let max = 5
    for (let i = 1; i <= max; i++) {
        fill_canvas(`rgba(20, 20, 20, ${i/max})`)
        await sleep(500)
    }
    await sleep(500)
    ctx.font = `bold ${Config.menu.title.title_height}px Copperplate Gothic Light`
    ctx.strokeColor = Config.menu.text_color
    ctx.textAlign = "center";
    ctx.strokeText("GAME OVER!", doc_width/2, doc_height/2)
    ctx.font = `${Config.menu.title.welcome_height}px Copperplate Gothic`
    let winner = "Top";
    if (losing_side == "top") {
        winner = "Bottom"
    }
    await sleep(1000)
    ctx.strokeText(`${winner} Paddle Has Won!`, doc_width/2, doc_height/2 + 50)
    //alert(`Side ${losing_side} has lost! Points - Top: ${scores["top"]}, Bottom: ${scores["bottom"]}`);
    console.log(`Side ${losing_side} has lost! Points - Top: ${scores["top"]}, Bottom: ${scores["bottom"]}`);
}