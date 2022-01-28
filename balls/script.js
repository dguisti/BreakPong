canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function distanceSprites(sprite1, sprite2) {
    return Math.sqrt(Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2));
}

function distancePoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

class Controller {
    constructor() {
        setInterval(() => { this.update(); }, 1);
        this.sprites = [];
    }
    update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let sprite of this.sprites) {
            if (sprite.rigidBody) {
                sprite.x += sprite.rigidBody.vel.x;
                sprite.y += sprite.rigidBody.vel.y;
            }
            if (sprite.collider) {
                sprite.collider.x = sprite.x;
                sprite.collider.y = sprite.y;
            }
            sprite.draw();
        }
    }
    registerSprite(sprite) {
        this.sprites.push(sprite);
    }

}

class SpriteComplex {
    collider;
    rigidBody;

    constructor(x, y, style) {
        this.x = x;
        this.y = y;
        this.style = style;
    }

    draw() {
        return null;
    }

    appendRigidBody(rigidBody) {
        this.rigidBody = rigidBody;
    }

    get rigidBody() {
        return this.rigidBody;
    }

    appendCollider(collider) {
        this.collider = collider;
    }

    get collider() {
        return this.collider;
    }

};

class RigidBody {
    constructor(vel = { x: 0, y: 0 }) {
        this.vel = vel;
    }
}


class Collider {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    inserectsObject(collider) {
        return null;
    }

    intersectsPoint(point) {
        return null;
    }

    intersectsLine(line) {
        return null;
    }
}

class Rect {
    x1;
    y1;
    x2;
    y2;

    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
}

class Circle {
    x;
    y;
    r;
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        

    slope_to(x, y) {
        
    }this.r = r;
    }
}

class Point {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    slope;
    point;

    constructor(slope, point) {
        this.slope = slope;
        this.point = point;
    }

    getY(x) {
        return this.slope * (x - this.point.x) + this.point.y;
    }
}

class Poly {
    points;

    constructor(points = []) {
        this.points = points;
    }
}

class BoxCollider extends Collider {
    constructor(x, y, rect) {
        super(x, y, BoxCollider);
        this.rect = rect;
    }

    intersectsPoint(x, y) {
        let x1 = Math.min(this.rect.x1, this.rect.x2);
        let x2 = Math.max(this.rect.x1, this.rect.x2);
        let y1 = Math.min(this.rect.y1, this.rect.y2);
        let y2 = Math.max(this.rect.y1, this.rect.y2);

        return (x >= x1 && x <= x2) && (y >= y1 && y <= y2);
    }

    intersectsLine(line) {
        let x1 = Math.min(this.rect.x1, this.rect.x2);
        let x2 = Math.max(this.rect.x1, this.rect.x2);
        let y1 = Math.min(this.rect.y1, this.rect.y2);
        let y2 = Math.max(this.rect.y1, this.rect.y2);

        return (y1 >= line.getY(x1)) && (y2 <= line.getY(x2));
    }
      

    intersectsObject(obj) {
        point_left =  new Point(this.rect.x1, this.rect.y1));
        point_right = new Point(this.rect.x2, this.rect.y2));
        
        slope_horiz = 0;
        slope_vert = 9999999999;

        line_left = Line(slope_vert, point_left);
        line_top = Line(slope_horiz, point_left);
        line_right = Line(slope_vert, point_right);
        line_bottom = Line(slope_horiz, point_right);

        return [line_left,
            line_top,
            line_right,
            line_bottom].some(
                (line) => {object.intersectsLine(line)}
            )
    }

}

class CircleCollider extends Collider {
    constructor(x, y, circle) {
        super(x, y, CircleCollider);
        this.circle = circle;
    }

    intersectsPoint(x, y) {
        return (distancePoints(x, y, this.x, this.y) <= this.r);
    }

    intersectsLine(line) {
        let x1 = this.x;
        let y1 = this.y;

        let slope = line.slope;
        let x2 = (slope * slope * line.point.x - slope * line.point.y + slope * y1 + x1) / (slope * slope + 1);
        let y2 = line.getY(x2);

        let dist = distancePoints(x1, y1, x2, y2);

        console.log(line);

        console.log("Slope:", slope, "X1:", x1, "Y1:", y1, "X2:", x2, "Y2:", y2);

        console.log(dist);

        return (dist <= this.circle.r);
    }

}

class BoxComplex extends SpriteComplex {
    constructor(x, y, w, h, style) {
        super(x, y, style);
        this.w = w;
        this.h = h;
    }
    draw() {
        ctx.fillStyle = this.style;
        ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    }
}

class CircleComplex extends SpriteComplex {
    constructor(x, y, r, style) {
        super(x, y, style);
        this.r = r;
    }
    draw() {
        ctx.fillStyle = this.style;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

class Bouncer extends CircleComplex {
    constructor(x, y, r, style, vel = { x: 0, y: 0 }) {
        super(x, y, r, style);
        this.appendRigidBody(new RigidBody(vel));
        this.appendCollider(new CircleCollider(x, y, new Circle(x, y, r)));
        //setInterval(() => { this.bounce(); }, 1);
    }
    draw() {
        super.draw();
        let top = new Line(0, new Point(0, 0)); console.log("Top:");
        let intersectsTop = this.collider.intersectsLine(top);
        let bottom = new Line(0, new Point(0, canvas.height)); console.log("Bottom:");
        let intersectsBottom = this.collider.intersectsLine(bottom);
        let left = new Line(9999999999, new Point(0, 0)); console.log("Left:");
        let intersectsLeft = this.collider.intersectsLine(left);
        let right = new Line(9999999999, new Point(canvas.width, 0)); console.log("Right:");
        let intersectsRight = this.collider.intersectsLine(right);
        console.log("X:", this.collider.x, "Y:", this.collider.y, "Vel:", this.rigidBody.vel);
        if (intersectsTop || intersectsBottom) {
            this.rigidBody.vel.y *= -1;
            controller.registerSprite(new Bouncer(this.x, this.y + 10 * Math.sign(this.rigidBody.vel.y), Math.random() * 5 + this.r, "red", vel = { x: this.rigidBody.vel.x + Math.random() / 2, y: this.rigidBody.vel.y + Math.random() / 2 }));
        }
        if (intersectsLeft || intersectsRight) {
            this.rigidBody.vel.x *= -1;
            controller.registerSprite(new Bouncer(this.x + 10 * Math.sign(this.rigidBody.vel.x), this.y, Math.random() * 5 + this.r, "red", vel = { x: this.rigidBody.vel.x + Math.random() / 2, y: this.rigidBody.vel.y + Math.random() / 2 }));
        }
    }
    bounce() {
        this.x += this.rigidBody.vel.x;
        this.y += this.rigidBody.vel.y;
        if (this.x > canvas.width || this.x < 0)
            this.vel.x *= -1;
        if (this.y > canvas.height || this.y < 0)
            this.vel.y *= -1;
    }
}

/*class Ball {
    constructor(x, y, r, color, vel = { x: 0, y: 0 }) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.vel = vel;
        setInterval(() => { this.bounce(); }, 1);
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    bounce() {
        this.x += this.vel.x;
        this.y += this.vel.y;
        if (this.x > canvas.width || this.x < 0)
            this.vel.x *= -1
        if (this.y > canvas.height || this.y < 0)
            this.vel.y *= -1
    }
}*/

let controller = new Controller();
//let box = new Box(25, 25, 50, 50, "rgb(3, 94, 252)");
let ball = new Bouncer(60, 60, 25, "red", vel = { x: 1.5, y: 1.5 });
//controller.registerObject(box);
controller.registerSprite(ball);
//var speed = 0.5;
//setInterval(() => { box.x += speed; }, 1);