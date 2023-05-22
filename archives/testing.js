function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Log drawing until keep_drawing is false
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

    largest_width = ctx.measureText("GO!").width;
    ctx.lineWidth = 5;
    ctx.strokeRect(doc_width/2 - largest_width/2 - timer_padding, doc_height/2 - timer_height/2 - timer_padding*1, largest_width + timer_padding*2, timer_height + timer_padding*2);
    ctx.fillRect(doc_width/2 - largest_width/2 - timer_padding, doc_height/2 - timer_height/2 - timer_padding*1, largest_width + timer_padding*2, timer_height + timer_padding*2);

    ctx.lineWidth = 1;
    ctx.strokeText(txt, doc_width/2, doc_height/2);
    ctx.restore();
}

async function game_countdown() {
    timer = {
        text: "3",
    };
    
    bf.draw_init(after=() => {
        draw_timer(timer);
    });
    
    for ([text, wait_mult] of [["3", 0], ["2", 1], ["1", 2], ["GO!", 3]]) {
        timers.push(setTimeout(function(text) {
            timer.text = text;
        }, time_dif * wait_mult, text));
    }
    
    timers.push(setTimeout(function() {
        start_game();
    }, time_dif*4));
}

/*
function game_countdown(timer) {
    

    bf.draw_init();


    timers.push(setTimeout(function() {
        start_game();
    }, time_dif*4));
}


async function timestuff() {
    var timer = { time: 4 };
    timer.time = 3;
    draw_timer(timer);
    await sleep(1000);
    timer.time = 2;
    await sleep(1000);
    timer.time = 1;
    await sleep(1000);
    timer.time = 0;
}

timestuff();
*/