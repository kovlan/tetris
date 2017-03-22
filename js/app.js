//====================================
// ImageSet - all images, indexes, file paths

var ImageSet = function() {
    this.folder = 'images';
    this.ext = '.png';
    this.id2name = ['bkg', 'red', 'green', 'blue', 'yellow', 'purple', 'brown', 'pink'];
}

ImageSet.prototype.getImageByIndex = function(index) {
    return this.id2name[index];
}

ImageSet.prototype.getPathByIndex = function(index) {
    return this.folder + '/' + this.id2name[index] + this.ext;
}

ImageSet.prototype.getBkgPath = function() {
    return this.getPathByIndex(0);
}

ImageSet.prototype.getAllPaths = function() {
    var result = [];
    for (var i in this.id2name) {
        result.push(this.getPathByIndex(i));
    }
    return result;
}


//===================================
// Field - current status of game field

var Field = function(cols, rows) {
    console.assert(rows > 0 && cols > 0);
    console.assert(rows < 1000 && cols < 1000);

    this.rows = rows;
    this.cols = cols;
    this.elems = new Array(rows);
    for (var i = 0; i < rows; ++i) {
        this.elems[i] = new Array(cols);
        for (var j = 0; j < cols; ++j) {
            this.elems[i][j] = 0;
        }
    }
}

Field.prototype.getValue = function(x, y) {
    return this.elems[y][x];
}

Field.prototype.isValidElem = function(elem) {
    var pts = elem.getPts();
    for (var i in pts) {
        var x = Math.floor(pts[i].x);
        if (x < 0 || x >= this.cols || pts[i].y >= this.rows - 1) {
            return false;
        }

        var y = Math.floor(pts[i].y);
        if (y >= 0 && this.elems[y][x] > 0) {
            return false;
        }

        y = Math.ceil(pts[i].y);
        if (y >= 0 && this.elems[y][x] > 0) {
            return false;
        }
    }
    return true;
}

Field.prototype.freezeElem = function(elem) {
    var pts = elem.getPts();
    for (var i in pts) {
        var x = Math.floor(pts[i].x);
        var y = Math.floor(pts[i].y);
        if (x >= 0 && x < this.cols &&
            y >= 0 && y < this.rows) {
            this.elems[y][x] = elem.getID();
        }
    }
}

Field.prototype.checkAndDelete = function() {
    for (var y = this.rows-1; y >= 0; --y) {
        var all = true;
        for (var x = 0; x < this.cols; ++x) {
            if (this.elems[y][x] == 0) {
                all = false;
            }
        }
        if (!all) {
            continue;
        }
        for (var y2 = y; y2 >= 1; --y2) {
            for (var x2 = 0; x2 < this.cols; ++x2) {
                this.elems[y2][x2] = this.elems[y2-1][x2];
            }
        }
        for (var x2 = 0; x2 < this.cols; ++x2) {
            this.elems[0][x2] = 0;
        }
    }
}


//======================================
// Tetelem - tetris element
var Tetelem = function(points, speed, id) {
    this.pts = points;
    this.speed = speed;
    this.id = id;

    this.center = { 'x': 0, 'y': 0};
    for (var i = 0; i < this.pts.length; ++i) {
        this.center.x += this.pts[i].x;
        this.center.y += this.pts[i].y;
    }
    this.center.x = Math.round(this.center.x / this.pts.length);
    this.center.y = Math.round(this.center.y / this.pts.length);
    this.computeCenter();
}

Tetelem.prototype.computeCenter = function() {
    this.center = { 'x': 0, 'y': 0};
    for (var i = 0; i < this.pts.length; ++i) {
        this.center.x += this.pts[i].x;
        this.center.y += this.pts[i].y;
    }
    this.center.x = Math.round(this.center.x / this.pts.length);
    this.center.y = Math.round(this.center.y / this.pts.length);
}

Tetelem.prototype.update = function(dt) {
    for (var i in this.pts) {
        this.pts[i].y += this.speed * dt;
    }
    this.center.y += this.speed * dt;
}

Tetelem.prototype.getID = function() {
    return this.id;
}

Tetelem.prototype.getPts = function() {
    return this.pts;
}

Tetelem.prototype.setPts = function(pts) {
    this.pts = pts;
    this.computeCenter();
}

Tetelem.prototype.rotateCW = function() {
    var rotatePoint = function(pt, center) {
        var xv = pt.x - center.x;
        var yv = pt.y - center.y;
        return { 'x': Math.round(center.x - yv), 'y': Math.round(center.y + xv)};
    }

    var new_pts = [];
    for (i in this.pts) {
        new_pts.push(rotatePoint(this.pts[i], this.center));
    }
    this.pts = new_pts;
    this.computeCenter();
}

Tetelem.prototype.rotateCCW = function() {
    var rotatePoint = function(pt, center) {
        var xv = pt.x - center.x;
        var yv = pt.y - center.y;
        return { 'x': Math.round(center.x + yv), 'y': Math.round(center.y - xv)};
    }

    var new_pts = [];
    for (i in this.pts) {
        new_pts.push(rotatePoint(this.pts[i], this.center));
    }
    this.pts = new_pts;
    this.computeCenter();
}

Tetelem.prototype.moveLeft = function() {
    for (i in this.pts) {
        this.pts[i].x--;
    }
    this.center.x--;
}

Tetelem.prototype.moveRight = function() {
    for (i in this.pts) {
        this.pts[i].x++;
    }
    this.center.x++;
}

Tetelem.prototype.moveDown = function() {
    for (i in this.pts) {
        this.pts[i].y++;
    }
    this.center.y++;
}

Tetelem.prototype.moveUp = function() {
    for (i in this.pts) {
        this.pts[i].y--;
    }
    this.center.y--;
}

Tetelem.prototype.round = function() {
    for (i in this.pts) {
        this.pts[i].y = Math.round(this.pts[i].y);
    }
    this.center.y = Math.round(this.center.y);
}

Tetelem.prototype.floor = function() {
    for (i in this.pts) {
        this.pts[i].y = Math.floor(this.pts[i].y);
    }
    this.center.y = Math.floor(this.center.y);
}


//====================================
// Factory for tetris elements
var base_speed = 5;
var dspeed = 0.05;
var createTetelem = function(width, height) {
    id = Math.floor((Math.random() * 7) + 1);
    x = Math.floor((Math.random() * (width - 6)) + 3);
    y = 0;
    pts = [];
    switch (id) {
        case 1:  // ----
            pts.push({'x': x, 'y': y});
            pts.push({'x': x-1, 'y': y});
            pts.push({'x': x+1, 'y': y});
            pts.push({'x': x-2, 'y': y});
            break;
        case 2:  // _|^
            pts.push({'x': x, 'y': y});
            pts.push({'x': x-1, 'y': y});
            pts.push({'x': x, 'y': y+1});
            pts.push({'x': x+1, 'y': y+1});
            break;
        case 3:  // ^|_
            pts.push({'x': x, 'y': y});
            pts.push({'x': x+1, 'y': y});
            pts.push({'x': x, 'y': y+1});
            pts.push({'x': x-1, 'y': y+1});
            break;
        case 4:  // ___|
            pts.push({'x': x, 'y': y});
            pts.push({'x': x-1, 'y': y});
            pts.push({'x': x+1, 'y': y});
            pts.push({'x': x+1, 'y': y-1});
            break;
        case 5:  // ^T^
            pts.push({'x': x, 'y': y});
            pts.push({'x': x-1, 'y': y});
            pts.push({'x': x+1, 'y': y});
            pts.push({'x': x, 'y': y+1});
            break;
        case 6:  // ^^|
            pts.push({'x': x, 'y': y});
            pts.push({'x': x-1, 'y': y});
            pts.push({'x': x+1, 'y': y});
            pts.push({'x': x+1, 'y': y+1});
            break;
        case 7:  // ||
            pts.push({'x': x, 'y': y});
            pts.push({'x': x-1, 'y': y});
            pts.push({'x': x, 'y': y+1});
            pts.push({'x': x-1, 'y': y+1});
            break;
        default:
            console.assert(false);
    }

    var rots = Math.floor((Math.random() * 4));
    var result = new Tetelem(pts, base_speed, id);
    for (var i = 0; i < rots; ++i) {
        result.rotateCW();
    }
    base_speed += dspeed;
    return result;
}
