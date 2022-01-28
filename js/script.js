// Setup canvas + context
canvas = document.getElementById("main-canv");
ctx = canvas.getContext("2d");
background_color = "#141414"

run_interval = 5 //ns

// Get doc height
//doc_height = document.body.clientHeight;
//doc_width = document.body.clientWidth;

function resize_canvas() {
    doc_height = window.innerHeight;
    doc_width = window.innerWidth;
    
    doc_width  = window.innerWidth || document.documentElement.clientWidth || 
    document.body.clientWidth;
    doc_height = window.innerHeight || document.documentElement.clientHeight || 
    document.body.clientHeight;
    
    canvas.height = doc_height;
    canvas.width = doc_width;
    
    ctx.canvas.height = doc_height;
    ctx.canvas.width = doc_width;
}

resize_canvas()

// window.addEventListener("resize", resize_canvas);

// Setup scaling
ctx.save()
//ctx.scale(doc_height/1080, doc_width/1920);

// Current listener type
key_listener = "start";

// Set default difficulty
difficulty = 2

// Setup timers list
timers = []

function fill_canvas(color) {
    //ctx.restore()
    //ctx.save()
    if (color == "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    //ctx.scale(doc_height/1080, doc_width/1920);
}

function initialize() {
    // Background rect
    fill_canvas(background_color)


    // Title + Welcome text
    ctx.strokeStyle = "#FFFFFF";

    welcome_height = 40;
    title_height = 60;
    info_height = 30;

    time_dif = 750;

    delay = 250;

    welcome_timer = setTimeout(function() {
        ctx.font = `bold ${welcome_height}px Copperplate`;
        ctx.textAlign = "center";
        ctx.strokeText("Welcome    ", doc_width/2, doc_height/2 - title_height - welcome_height*1.5);
    }, time_dif * 0 + delay);

    to_timer = setTimeout(function() {
        ctx.font = `bold ${welcome_height}px Copperplate`;
        ctx.textAlign = "center";
        ctx.strokeText("to", doc_width/2+ctx.measureText("Welcome ").width/2, doc_height/2 - title_height - welcome_height*1.5);
    }, time_dif * 1 + delay);

    title_timer = setTimeout(function() {
        ctx.font = `bold ${title_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("BreakPong", doc_width/2, doc_height/2 - title_height);
    }, time_dif * 2 + delay);

    info_timer = setTimeout(function() {
        ctx.font = `bold ${info_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Press Enter To Start", doc_width/2, doc_height/2 + info_height);
    }, time_dif * 3 + delay);

    timers.push(welcome_timer, to_timer, title_timer, info_timer)
}

function set_difficulty() {
    // Clear canvas
    //ctx.fillStyle = background_color;
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    fill_canvas(background_color)

    ctx.strokeStyle = "#FFFFFF";

    time_dif = 200;

    // Sizing
    difficulty_height = 60;
    selections_height = 30;
    info_height = 20;
    box_padding = 10;

    ctx.font = `bold ${difficulty_height}px Copperplate Gothic Light`;
    dif_size = ctx.measureText("Difficulty")

    difficulty_timer = setTimeout(function() {
        ctx.font = `bold ${difficulty_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Difficulty", doc_width/2, doc_height/4);
    }, time_dif * 0);

    selection1_timer = setTimeout(function() {
        ctx.font = `bold ${selections_height}px Copperplate`;
        ctx.textAlign = "left";
        txt = "1: Easy";
        ctx.strokeText(txt, doc_width/2 - dif_size.width/4, doc_height/4 + difficulty_height*1);
        ctx.lineWidth = 3;
        ctx.strokeRect(doc_width/2 - dif_size.width/4 - box_padding, doc_height/4 + difficulty_height - selections_height, dif_size.width/2 + box_padding*2, selections_height + box_padding*2)
        ctx.lineWidth = 1;
    }, time_dif * 1);

    selection2_timer = setTimeout(function() {
        ctx.font = `bold ${selections_height}px Copperplate`;
        ctx.textAlign = "left";
        txt = "2: Normal";
        ctx.strokeText(txt, doc_width/2 - dif_size.width/4, doc_height/4 + difficulty_height*2);
        ctx.lineWidth = 3;
        ctx.strokeRect(doc_width/2 - dif_size.width/4 - box_padding, doc_height/4 + difficulty_height*2 - selections_height, dif_size.width/2 + box_padding*2, selections_height + box_padding*2)
        ctx.lineWidth = 1;
    }, time_dif * 2);

    selection3_timer = setTimeout(function() {
        ctx.font = `bold ${selections_height}px Copperplate`;
        ctx.textAlign = "left";
        txt = "3: Hard";
        ctx.strokeText(txt, doc_width/2 - dif_size.width/4, doc_height/4 + difficulty_height*3);
        ctx.lineWidth = 3;
        ctx.strokeRect(doc_width/2 - dif_size.width/4 - box_padding, doc_height/4 + difficulty_height*3 - selections_height, dif_size.width/2 + box_padding*2, selections_height + box_padding*2)
        ctx.lineWidth = 1;
    }, time_dif * 3);

    selection4_timer = setTimeout(function() {
        ctx.font = `bold ${selections_height}px Copperplate`;
        ctx.textAlign = "left";
        txt = "4: Help";
        ctx.strokeText(txt, doc_width/2 - dif_size.width/4, doc_height/4 + difficulty_height*4);
        ctx.lineWidth = 3;
        ctx.strokeRect(doc_width/2 - dif_size.width/4 - box_padding, doc_height/4 + difficulty_height*4 - selections_height, dif_size.width/2 + box_padding*2, selections_height + box_padding*2)
        ctx.lineWidth = 1;
    }, time_dif * 4);

    info_timer = setTimeout(function() {
        ctx.font = `bold ${info_height}px Copperplate Gothic Light`;
        ctx.textAlign = "center";
        ctx.strokeText("Press Key To Select", doc_width/2, doc_height/4 + difficulty_height*5);
    }, time_dif * 5);

    timers.push(difficulty_timer, selection1_timer, selection2_timer, selection3_timer, selection4_timer, info_timer);
}

function prep_game() {
    // Clear canvas
    //ctx.fillStyle = "#0022AA";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw_background()
    console.log("Difficulty:", difficulty);
    game_countdown()
}

async function draw_timer(timer) {
    timer_height = 60;
    time_dif = 1000;
    timer_padding = 10;
    ctx.save();
    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = background_color;
    ctx.font = `bold ${timer_height}px Copperplate`;
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    txt = timer.text;
    if (timer.text == null) {
        txt = "GO!";
    }

    largest_width = ctx.measureText("GO!").width;
    ctx.lineWidth = 5;
    ctx.strokeRect(doc_width/2 - largest_width/2 - timer_padding, doc_height/2 - timer_height/2 - timer_padding*1, largest_width + timer_padding*2, timer_height + timer_padding*2);
    ctx.fillRect(doc_width/2 - largest_width/2 - timer_padding, doc_height/2 - timer_height/2 - timer_padding*1, largest_width + timer_padding*2, timer_height + timer_padding*2);

    ctx.lineWidth = 1;
    ctx.strokeText(txt, doc_width/2, doc_height/2);
    ctx.restore();
}

/*
function game_countdown() {
    time_dif = 1000

    timer_height = 60

    timer_padding = 10

    for ([text, wait_mult] of [["3", 0], ["2", 1], ["1", 2], ["GO!", 3]]) {
        timers.push(setTimeout(function(text, wait_mult) {
            ctx.save();
            ctx.strokeStyle = "#FFFFFF";
            ctx.fillStyle = background_color;
            ctx.font = `bold ${timer_height}px Copperplate`;
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            txt = text;

            largest_width = ctx.measureText("GO!").width;
            ctx.lineWidth = 5;
            ctx.strokeRect(doc_width/2 - largest_width/2 - timer_padding, doc_height/2 - timer_height/2 - timer_padding*1, largest_width + timer_padding*2, timer_height + timer_padding*2);
            ctx.fillRect(doc_width/2 - largest_width/2 - timer_padding, doc_height/2 - timer_height/2 - timer_padding*1, largest_width + timer_padding*2, timer_height + timer_padding*2);

            ctx.lineWidth = 1;
            ctx.strokeText(txt, doc_width/2, doc_height/2);
            ctx.restore();
        }, time_dif * wait_mult, text, wait_mult));
    }

    bf.draw_init();


    timers.push(setTimeout(function() {
        start_game();
    }, time_dif*4));
}
*/

async function game_countdown() {
    timer = {
        text: "3",
    };

    time_dif = 1000/superspeed;

    for ([text, wait_mult] of [["3", 0], ["2", 1], ["1", 2], ["GO!", 3], [null, 4]]) {
        timers.push(setTimeout(function(text) {
            timer.text = text;
        }, time_dif * wait_mult, text));
    }
    
    await bf.draw_init(() => {}, () => {
        draw_timer(timer);
    });
    
    while (timer.text != null) {
        draw_timer(timer);
        await sleep(1);
    }
    //timer.text = "GO!"
    //draw_timer(timer)

    start_game();
}

function start_game() {
    key_listener = "game";
    reset_timers();
    draw_all();
    run();
}

function run() {
    setInterval(function() {

        paddle_bottom.move(paddle_bottom_dx);
        paddle_top.move(paddle_top_dx);

        paddle_top_dx -= Math.sign(paddle_top_dx) * Math.min(Math.abs(paddle_friction), Math.abs(paddle_top_dx));
        paddle_bottom_dx -= Math.sign(paddle_bottom_dx) * Math.min(Math.abs(paddle_friction), Math.abs(paddle_bottom_dx));

        ball_bottom.move(bf.all_bricks, [paddle_bottom, paddle_top]);
        ball_top.move(bf.all_bricks, [paddle_bottom, paddle_top]);
        draw_all();

    }, run_interval);
}

function reset_timers() {
    for (timer of timers) {
        clearTimeout(timer);
    }
    timers = [];
}

function draw_background() {
    ctx.save();
    fill_canvas(background_color);
    ctx.restore();
}

// Draw all
function draw_all() {
    ctx.save();
    
    draw_background();
    bf.draw();
    paddle_bottom.draw();
    paddle_top.draw();
    ball_bottom.draw();
    ball_top.draw();

    ctx.restore();
}

/*
function key_press_event(key) {
    // Title of game
    if (key_listener == "start") {
        if (key.key == "Enter") {
            // Change listener style
            key_listener = "difficulty";
            // Clear all timers
            reset_timers();
            // Start game
            set_difficulty();
        }
    } else if (key_listener == "difficulty") {
        switch (key.key) {
            // Valid difficulty keys
            case "1":
                difficulty = 1;
                key_listener = "start_game";
                break;
            case "2":
                difficulty = 2;
                key_listener = "start_game";
                break;
            case "3":
                difficulty = 3;
                key_listener = "start_game";
                break;
            case "4":
                // Help
                window.location = "https://breakpong.rolkin.repl.co/Help/help.html"
                break;
        }
        // If valid difficulty key was detected, start the game
        if (key_listener == "start_game") {
            reset_timers();
            prep_game();
        }
    } else if (key_listener == "game") {
        force = 3;
        // Change direction of lower paddle
        if (key.key == "ArrowLeft" || key.key == "ArrowRight") {
            // On keyup, reset movement
            if (key.type == "keyup") {
                paddle_bottom_dx = 0
            // Left movement = negative
            } else if (key.key == "ArrowLeft") {
                paddle_bottom_dx = -force
            // Right movement = positive
            } else if (key.key == "ArrowRight") {
                paddle_bottom_dx = force
            }
        }
        // Change direction of upper paddle
        if (key.key == "a" || key.key == "d") {
            console.log("Top")
            // A = left movement = negative
            if (key.key == "a") {
                paddle_top_dx = -force
            // D = right movement = positive
            } else if (key.key == "d") {
                paddle_top_dx = force
            } 
        }
    }
}
*/

key_map = {
    "a": false,
    "d": false,
    "ArrowLeft": false,
    "ArrowRight": false,
    "Enter": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false
}

function updateKeys(key) {
    key_name = key.key;
    old_key = key_map[key_name];
    if (key.type == "keydown") {
        key_map[key_name] = true;
    } else {
        key_map[key_name] = false;
    }
}

function key_press_event() {
    // Title of game
    if (key_listener == "start") {
        if (key_map["Enter"]) {
            // Change listener style
            key_listener = "difficulty";
            // Clear all timers
            reset_timers();
            // Start game
            set_difficulty();
        }
    } else if (key_listener == "difficulty") {
        if (key_map["1"]) {
            difficulty = 1;
            key_listener = "start_game";
        } else if (key_map["2"]) {
            difficulty = 2;
            key_listener = "start_game";
        } else if (key_map["3"]) {
            difficulty = 3;
            key_listener = "start_game";
        } else if (key_map["4"]) {
            // Help
            window.location = "https://breakpong.rolkin.repl.co/Help/help.html"
        }
        // If valid difficulty key was detected, start the game
        if (key_listener == "start_game") {
            reset_timers();
            prep_game();
        }
    } else if (key_listener == "game") {
        force = 0.4;
        // Change direction of upper paddle
        if (key_map["a"] && key_map["d"]) {
            paddle_top_dx -= Math.sign(paddle_top_dx) * Math.min(Math.abs(paddle_friction), Math.abs(paddle_top_dx))/3;
        } else if (key_map["a"]) {
            paddle_top_dx -= force;
        } else if (key_map["d"]) {
            paddle_top_dx += force;
        }
        if (Math.abs(paddle_top_dx) > MAX_SPEED) {
            paddle_top_dx = MAX_SPEED * Math.sign(paddle_top_dx)
        }
        // Change direction of lower paddle
        if (key_map["ArrowLeft"] && key_map["ArrowRight"]) {
            paddle_bottom_dx = 0;
        } else if (key_map["ArrowLeft"]) {
            paddle_bottom_dx -= force;
        } else if (key_map["ArrowRight"]) {
            paddle_bottom_dx += force;
        }
        if (Math.abs(paddle_bottom_dx) > MAX_SPEED) {
            paddle_bottom_dx = MAX_SPEED * Math.sign(paddle_bottom_dx)
        }
    }
}

document.addEventListener("keydown", updateKeys);
document.addEventListener("keyup", updateKeys);

setInterval(key_press_event, run_interval);

bf = new BrickFactory(7, 15, 0, canvas.height/3, canvas.width, canvas.height/3);

paddle_width = 200;
paddle_height = 25;

MAX_SPEED = 5;

paddle_bottom_dx = 0;
paddle_top_dx = 0;
paddle_friction = 0.1;

paddle_bottom = new BrickStruct("yellow", doc_width/2 - paddle_width/2, doc_height - paddle_height*1.5, paddle_width, paddle_height, false);
paddle_top = new BrickStruct("green", doc_width/2 - paddle_width/2, paddle_height*.5, paddle_width, paddle_height, false);

ball_radius = 15;
ball_bottom = new Ball(doc_width/4, 5*doc_height/6, ball_radius, "blue", 0, -1, 1);
ball_top = new Ball(doc_width/4, 1*doc_height/6, ball_radius, "white", 0, 1, 1);

initialize();


/*
function slow_type(start_x, start_y, font_style, font_fill, font_stroke, text_align, char_sep=50, wait=50, ...text) {
    // Save elements for reset
    ctx.save();

    ctx.font = font_style;
    ctx.fillStyle = font_fill;
    ctx.strokeStyle = font_stroke;
    ctx.textAlign = text_align;

    current_x = start_x
    current_y = start_y

    for (const [index, item] of text.entries()) {
        setTimeout(function(current_x) {
            ctx.fillText(item, current_x, current_y)
            ctx.strokeText(item, current_x, current_y)
            console.log("test", item, current_x, current_y)
        }, wait*(index+1), current_x);
        current_x += char_sep
        console.log(item, current_x, current_y)
    }

    ctx.restore();
}
*/