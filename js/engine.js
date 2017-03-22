
var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var canvas_width = 320;
    var canvas_height = 520;
    var offset_x = 10;
    var offset_y = 10;
    var elem_width = 20;
    var elem_height = 20;
    var field_width = 15;
    var field_height = 25;
    var field = new Field(field_width, field_height);
    var image_set = new ImageSet();
    var isElemInField = false;
    var elem = {};
    var count = 1000;
    ctx.actions = new Actions();

    canvas.width = canvas_width;
    canvas.height = canvas_height;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {

        if (!isElemInField) {
            elem = createTetelem(field_width, field_height);
            if (!field.isValidElem(elem)) {
                return;
                field = new Field(field_width, field_height);
            }
            isElemInField = true;
        }

        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;

        //count--;
        //if (count > 0) {
            win.requestAnimationFrame(main);
        //}
    }

    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    function act() {
        acts = ctx.actions.get();
        for (a in acts) {
            var backup_pts = [];
            var pts = elem.getPts();
            for (i in pts) {
                backup_pts.push({'x': pts[i].x, 'y': pts[i].y});
            }
            var full_break = false;

            switch (acts[a]) {
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
                elem.floor();
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
        ctx.actions.clear();
    }

    function update(dt) {
        act();
        
        elem.update(dt);
        if (!field.isValidElem(elem)) {
            field.freezeElem(elem);
            isElemInField = false;
            field.checkAndDelete();
        }
    }

    function render() {
        ctx.drawImage(Resources.get(image_set.getBkgPath()), 0, 0);
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
    }

    function reset() {
    }

    Resources.load(image_set.getAllPaths());
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            32: 'space'
        };

        if (allowedKeys[e.keyCode]) {
            ctx.actions.add(allowedKeys[e.keyCode]);
        }
    });

})(this);
