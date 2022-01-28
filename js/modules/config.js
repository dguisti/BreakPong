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

Config.game.bricks = await fetch("../../config/bricks.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});

Config.game.paddles = await fetch("../../config/paddles.json").then(response => {
    return response.json();
}).then(jsondata => {
    return jsondata;
});