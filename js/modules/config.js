export class Config {
}


Config.main = await fetch("../../config/main.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.game = await fetch("../../config/game.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.menu = await fetch("../../config/menu.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.game.brick = await fetch("../../config/brick.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.game.paddles = await fetch("../../config/paddle.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.game.ball = await fetch("../../config/ball.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.hacker = await fetch("../../config/hacker.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});