
var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var canvas_width = 320;
    var canvas_height = 550;
    var offset_x = 10;
    var offset_y = 10;
    var elem_width = 20;
    var elem_height = 20;
    var field_width = 15;
    var field_height = 21;
    var field = {};
    var image_set = new ImageSet();
    var isElemInField = false;
    var elem = {}, next_elem = {};
    var actions = [];
    var paused = false;
    var playing = true;

    canvas.width = canvas_width;
    canvas.height = canvas_height;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {

        var now = Date.now();
        if (!paused) {
            if (!isElemInField) {
                elem = next_elem;
                next_elem = createTetelem(field_width, field_height);
                if (!field.isValidElem(elem)) {
                    field.freezeElem(elem);
                    playing = false;
                }
                isElemInField = true;
            }
            
            var dt = (now - lastTime) / 1000.0;

            update(dt);
            render();
        }

        lastTime = now;

        if (playing) {
            win.requestAnimationFrame(main);
        }
    }

    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    function act() {
        for (a in actions) {
            var backup_pts = [];
            var pts = elem.getPts();
            for (i in pts) {
                backup_pts.push({'x': pts[i].x, 'y': pts[i].y});
            }
            var full_break = false;

            switch (actions[a]) {
            case 'left':
                elem.moveLeft();
                break;
            case 'right':
                elem.moveRight();
                break;
            case 'up':
                elem.rotateCCW();
                break;
            case 'down':
                elem.rotateCW();
                break;
            case 'space':
                while (field.isValidElem(elem)) {
                    elem.moveDown();
                }
                elem.moveUp();
                full_break = true;
                break;
            }

            if (full_break) {
                break;
            }
            if (!field.isValidElem(elem)) {
                elem.setPts(backup_pts);
            }
        }
        actions = [];
    }

    function update(dt) {
        act();
        
        elem.update(dt);
        if (!field.isValidElem(elem)) {
            elem.moveUp();
            field.freezeElem(elem);
            isElemInField = false;
            field.checkAndDelete();
        }
    }

    function render() {
        //ctx.drawImage(Resources.get(image_set.getBkgPath()), 0, 0);
        ctx.fillStyle='#CCCCCC';
        ctx.fillRect(0, 0, canvas_width, canvas_height);
        ctx.fillStyle='black';

        for (row = 0; row < field_height; row++) {
            for (col = 0; col < field_width; col++) {
                var ind = field.getValue(col, row);
                if (ind > 0) {
                    ctx.drawImage(Resources.get(image_set.getPathByIndex(ind)),
                        offset_x + col * elem_width,
                        offset_y + row * elem_height);
                }
            }
        }

        var bottom_line_y = offset_y + field_height * elem_height;
        var right_line_x = offset_x + field_width * elem_width;
        ctx.beginPath();
        ctx.moveTo(offset_x, 1);
        ctx.lineTo(offset_x, bottom_line_y);
        ctx.lineTo(offset_x + field_width * elem_width, bottom_line_y);
        ctx.lineTo(right_line_x, 1);
        ctx.stroke();

        ctx.font = '24px serif';
        ctx.fillText('Score: ' + field.getScore().toString(), 
                     offset_x,
                     bottom_line_y + 36);

        ctx.fillText('Elements: ' + field.getElemScore().toString(), 
                     offset_x,
                     bottom_line_y + 72);

        if (!isElemInField) {
            return;
        }

        elem_img = Resources.get(image_set.getPathByIndex(elem.getID()));
        elem_pts = elem.getPts();
        for (var i in elem_pts) {
            ctx.drawImage(elem_img,
                          offset_x + elem_pts[i].x * elem_width,
                          offset_y + elem_pts[i].y * elem_height);
        }

        elem_img = Resources.get(image_set.getPathByIndex(next_elem.getID()));
        elem_pts = next_elem.getPts();
        var min_x = elem_pts[0].x, min_y = elem_pts[0].y;
        for (var i = 1; i < elem_pts.length; ++i) {
            if (min_x > elem_pts[i].x) {
                min_x = elem_pts[i].x;
            }
            if (min_y > elem_pts[i].y) {
                min_y = elem_pts[i].y;
            }
        }
        for (var i in elem_pts) {
            ctx.drawImage(elem_img,
                          Math.round(canvas_width * 0.7) + (elem_pts[i].x - min_x) * elem_width,
                          bottom_line_y + 36 + (elem_pts[i].y - min_y) * elem_height);
        }
    }

    function reset() {
        initCreateTelem();
        field = new Field(field_width, field_height);
        isElemInField = false;
        elem = {};
        actions = [];
        paused = false;
        playing = true;
        next_elem = createTetelem(field_width, field_height);
    }

    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            32: 'space'
        };

        // pause/resume on P/p
        if (e.keyCode == 80 || e.keyCode == 112) {
            paused = !paused;
        }

        // start new game
        if (e.keyCode == 13 && !playing) {
            win.requestAnimationFrame(init);
        }

        // move
        if (allowedKeys[e.keyCode]) {
            actions.push(allowedKeys[e.keyCode]);
        }
    });

    Resources.load(image_set.getAllPaths());
    Resources.onReady(init);

})(this);
