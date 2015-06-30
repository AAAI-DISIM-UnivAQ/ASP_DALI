var MYPIXI = function(container) {

    var _container = container;
    var instance = this.instance = this;

    this.constant = {}
    this.constant.ACTION_HOLE = "hole"
    this.constant.ACTION_MARK = "mark"

    this.forbidden = [];
    this.mandatory = [];
    this.action = 'hole'

    this.createRenderer = function() {
        var renderer = PIXI.autoDetectRenderer(_container.innerWidth(),
                _container.innerHeight(),
                {backgroundColor: 0x333333});
        // 0x1099bb
        renderer.view.id = "canvas";

        _container[0].appendChild(renderer.view);

        var stage = new PIXI.Container();
        stage.interactive = true;

        function animate() {
            controlHorsePosition();
            renderer.render(stage);
            requestAnimationFrame(animate);
        }

        //// run the render loop
        animate();

        this.renderer = renderer;
        this.stage = stage;

//        window.addEventListener('resize', (function() {
//            this.renderer.view.width = _container.innerWidth();
//            this.renderer.view.height = _container.innerHeight();
//        }).bind(this), false);
    };
    
    this.adjustSize = function(size) {
        if (size) {
            this.renderer.view.width = size.width;
            this.renderer.view.height = size.height;
        } else {
            this.renderer.view.width = _container.innerWidth();
            this.renderer.view.height = _container.innerHeight();
        }
    };

    this.cleanStage = function() {
        this.stage.removeChildren();
    };

    this.drowChessboard = function(size) {
        this.cleanStage();
        this.forbidden = [];
        this.mandatory = [];

        var cellSize = Math.min((instance.renderer.height / size),
                (instance.renderer.width / size));
//        var borderSize = cellSize / 11;
        var borderSize = 0;
        cellSize -= (borderSize * 2);

        this.cellSize = cellSize;
        this.borderSize = borderSize;
        this.size = size;

        var borderFill = new PIXI.Graphics();
        borderFill.beginFill(0x333333);
        borderFill.drawRect(0, 0, (this.cellSize * size) + (this.borderSize * 2), (this.cellSize * size) + (this.borderSize * 2));
        borderFill.endFill();
        this.stage.addChild(borderFill);

        var chessboard = this.chessboard = new PIXI.Graphics();

        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                if ((i + j) % 2 > 0) {
                    chessboard.beginFill(0xA5630C);
                } else {
                    chessboard.beginFill(0xF9CA8D);
                }
                chessboard.drawRect(i * this.cellSize + this.borderSize, j * this.cellSize + this.borderSize, this.cellSize, this.cellSize);
                chessboard.endFill();
            }
        }

        chessboard.interactive = true;
        chessboard
                .on('mousedown', this.onDragStart)
                .on('touchstart', this.onDragStart)
                .on('mouseup', this.onDragEnd)
                .on('mouseupoutside', this.onDragEnd)
                .on('touchend', this.onDragEnd)
                .on('touchendoutside', this.onDragEnd)
                .on('mousemove', this.onDragMove)
                .on('touchmove', this.onDragMove);

        this.stage.addChild(chessboard);
        
        this.radius = Math.floor(instance.cellSize / 3);
        this.chessboard.innerBounds = instance.chessboard.getLocalBounds();
        this.chessboard.innerBounds.width = this.chessboard.innerBounds.width - this.radius - this.radius;
        this.chessboard.innerBounds.height = this.chessboard.innerBounds.height - this.radius - this.radius;
        this.chessboard.innerBounds.x = this.chessboard.innerBounds.x + this.radius;
        this.chessboard.innerBounds.y = this.chessboard.innerBounds.y + this.radius;

        var newForbidden = [];
        for (i in instance.forbidden) {
            var forb = instance.forbidden[i];
            if (forb.x < instance.size, forb.y < instance.size) {
                var newX = (instance.forbidden[i].x * instance.cellSize) + (instance.cellSize / 2);
                var newY = (instance.forbidden[i].y * instance.cellSize) + (instance.cellSize / 2);

                this.addHole({
                    x: (newX + instance.borderSize),
                    y: (newY + instance.borderSize)
                });
                newForbidden.push(forb);
            }
        }
        instance.forbidden = newForbidden;

        var newMandatory = [];
        for (i in instance.mandatory) {
            var mark = instance.mandatory[i];
            if (mark.x < instance.size, mark.y < instance.size) {
                var newX = (instance.mandatory[i].x * instance.cellSize) + (instance.cellSize / 2);
                var newY = (instance.mandatory[i].y * instance.cellSize) + (instance.cellSize / 2);

                this.addMark({
                    x: (newX + instance.borderSize),
                    y: (newY + instance.borderSize)
                });
                newMandatory.push(mark);
            }
        }
        instance.mandatory = newMandatory;
        
        this.adjustSize({
            width: borderFill.width,
            height: borderFill.height
        });
        
        this.containerPlan = new PIXI.Container();
        this.stage.addChild(this.containerPlan);
        
        this.horseSVG = new PIXI.Container();
        
        var spriteSVGImage = "img/chess-knight.svg";
        
        var horseSVGTexture = PIXI.Texture.fromImage(spriteSVGImage);
        var horseSVG = new PIXI.Sprite(horseSVGTexture);
        var ratio = horseSVG.height / horseSVG.width;
        
        horseSVG.height = this.cellSize/3;
        horseSVG.width = horseSVG.height / ratio ;
        horseSVG.position.set((cellSize-horseSVG.width) / 2, (cellSize-horseSVG.height) / 2);
        
        this.horseSVG.addChild(horseSVG);
        
        this.horseSVG.position.set(0, 0);
        //per animazione
        this.horseSVG.animationPosition = new PIXI.Point(0, 0);
        this.horseSVG.speed = 0.2;

        this.stage.addChild(this.horseSVG);
    };

    this.addHole = function(position) {
        this.hole = new PIXI.Graphics();
        this.hole.beginFill(0x000000);
        this.hole.drawCircle(0, 0, instance.cellSize / 3);
        this.hole.endFill();

        this.hole.interactive = true;
        this.hole
                .on('mousedown', instance.removeCell)
                .on('touchstart', instance.removeCell);

        this.hole.position.x = position.x;
        this.hole.position.y = position.y;

        instance.stage.addChild(this.hole);
    };
    this.addMark = function(position) {
        console.log('addMark');
        this.mark = new PIXI.Graphics();
        this.mark.beginFill(0xFFEA00);
        this.mark.drawCircle(0, 0, instance.cellSize / 3);
        this.mark.endFill();

        this.mark.interactive = true;
        this.mark
                .on('mousedown', instance.removeCell)
                .on('touchstart', instance.removeCell);

        this.mark.position.x = position.x;
        this.mark.position.y = position.y;

        instance.stage.addChild(this.mark);
    };

    this.onDragStart = function(event) {
        this.data = event.data;
        this.dragging = true;

        var position = this.data.getLocalPosition(this);
        if (instance.action == instance.constant.ACTION_HOLE){
            (instance.addHole).bind(this)(position);
        } else {
            (instance.addMark).bind(this)(position);
        }

    };

    this.onDragEnd = function() {
        if (this.dragging) {
            this.dragging = false;

            var marker = {};
            var instanceMarker = [];
            if (instance.action == instance.constant.ACTION_HOLE){
                marker = this.hole;
                instanceMarker = instance.forbidden;
            } else {
                marker = this.mark;
                instanceMarker = instance.mandatory;
            }

            var position = this.data.getLocalPosition(this);
            if (this.outside) {
                position = marker.position;
                delete this.outside;
            }

            var cell = {
                x: Math.floor(((position.x - instance.borderSize) / instance.cellSize)),
                y: Math.floor(((position.y - instance.borderSize) / instance.cellSize))
            };

            var isin = false;
            for (var x in instance.forbidden) {
                var cells = instance.forbidden[x];
                if (cells.x === cell.x && cells.y === cell.y) {
                    isin = true;
                    break;
                }
            }for (var x in instance.mandatory) {
                var cells = instance.mandatory[x];
                if (cells.x === cell.x && cells.y === cell.y) {
                    isin = true;
                    break;
                }
            }
            if (!isin && !( cell.x == 0 && cell.y == 0) ) {
                instanceMarker.push(cell);
                var newX = (cell.x * instance.cellSize) + (instance.cellSize / 2);
                var newY = (cell.y * instance.cellSize) + (instance.cellSize / 2);

                marker.position.x = newX + instance.borderSize;
                marker.position.y = newY + instance.borderSize;
            } else {
                marker.parent.removeChild(marker);
            }

            this.data = null;
        }
    };

    this.onDragMove = function() {
        if (this.dragging) {
            var marker = {};
            if (instance.action == instance.constant.ACTION_HOLE){
                marker = this.hole;
            } else {
                marker = this.mark;
            }
            var position = this.data.getLocalPosition(this);
            var radius = instance.radius;
            var pos1 = {x : position.x + radius, y: position.y + radius };
            var pos2 = {x : position.x - radius, y: position.y - radius };
            var pos3 = {x : position.x + radius, y: position.y - radius };
            var pos4 = {x : position.x + radius, y: position.y + radius };
            if (instance.chessboard.containsPoint(pos1) &&
                instance.chessboard.containsPoint(pos2) &&
                instance.chessboard.containsPoint(pos3) &&
                instance.chessboard.containsPoint(pos4) && true) {
                marker.position.x = position.x;
                marker.position.y = position.y;
                this.outside = false;
            } else {
                var bounds = instance.chessboard.innerBounds;
                marker.position.x = position.x > bounds.x ? Math.min(position.x, bounds.width + bounds.x): bounds.x;
                marker.position.y = position.y > bounds.y ? Math.min(position.y, bounds.height + bounds.y): bounds.y;
                this.outside = true;
            }
        }
    };

    this.removeCell = function(event) {
        var position = event.data.getLocalPosition(this.parent);

        var cell = {
            x: Math.floor(((position.x - instance.borderSize) / instance.cellSize)),
            y: Math.floor(((position.y - instance.borderSize) / instance.cellSize))
        };
        for (x in instance.forbidden) {
            var cells = instance.forbidden[x];
            if (cells.x === cell.x && cells.y === cell.y) {
                instance.forbidden.splice(x, 1);
                break;
            }
        }
        for (x in instance.mandatory) {
            var cells = instance.mandatory[x];
            if (cells.x === cell.x && cells.y === cell.y) {
                instance.mandatory.splice(x, 1);
                break;
            }
        }

        this.parent.removeChild(this);
    };
    
    
    // animation controls
    this.moveHorse = function(movimenti) {
        var mov = movimenti.splice(0,1)[0];
        mov = new PIXI.Point(mov.x-1, mov.y-1);
        this.drowReached(mov);
        this.drawLineHorse(this.getHorsePosition(), mov);
        this.horseSVG.animationPosition.set(mov.x*this.cellSize, mov.y*this.cellSize);
        var chiave = setInterval(function() {
            if(!instance.inAnimationHorseSVG()) {
                clearTimeout(chiave);
                if(movimenti.length > 0) {
                    instance.moveHorse(movimenti);
                }
            }
        }, 200);
    };
    this.drawLineHorse = function(point1, point2) {
        var center = this.cellSize/2;
        var line =  new PIXI.Graphics();
        line.beginFill(0xFFFFFF);
        line.lineStyle(2, 0xFFFFFF, 1);
        line.moveTo((point1.x*this.cellSize)+center, (point1.y*this.cellSize)+center);
        line.lineTo((point2.x*this.cellSize)+center, (point2.y*this.cellSize)+center);
        line.endFill();
        this.containerPlan.addChild(line);
    };
    this.drowReached = function(point) {
        var center = this.cellSize/2;
        var radius = this.cellSize/3;
        var circle = new PIXI.Graphics();
        circle.beginFill(0xFFFFFF);
        circle.drawCircle((point.x*this.cellSize)+center, (point.y*this.cellSize)+center, radius);
        circle.endFill();
        this.containerPlan.addChild(circle);
    };
    this.getHorsePosition = function() {
        return new PIXI.Point(this.horseSVG.position.x/this.cellSize, this.horseSVG.position.y/this.cellSize);
    };
    this.inAnimationHorseSVG = function() {
        return this.horseSVG.animationPosition.x !== this.horseSVG.position.x ||
               this.horseSVG.animationPosition.y !== this.horseSVG.position.y;
    };
    var controlHorsePosition = (function() {
        if(this.horseSVG) {
            if(this.horseSVG.animationPosition.x !== this.horseSVG.position.x) {
                var delta = Math.abs(Math.abs(this.horseSVG.animationPosition.x)-Math.abs(this.horseSVG.position.x));
                var jump = (delta < 1) ? delta : undefined;
                jump = jump || Math.max(Math.round(delta/(2/this.horseSVG.speed)), 1);
                
                if(this.horseSVG.animationPosition.x < this.horseSVG.position.x) {
                    this.horseSVG.position.x -=  jump;
                } else {
                    this.horseSVG.position.x += jump;
                }
            }
            if(this.horseSVG.animationPosition.y !== this.horseSVG.position.y) {
                var delta = Math.abs(Math.abs(this.horseSVG.animationPosition.y)-Math.abs(this.horseSVG.position.y));
                var jump = (delta < 1) ? delta : undefined;
                jump = jump || Math.max(Math.round(delta/(2/this.horseSVG.speed)), 1);
                
                if(this.horseSVG.animationPosition.y < this.horseSVG.position.y) {
                    this.horseSVG.position.y -= jump;
                } else {
                    this.horseSVG.position.y += jump;
                }
            }
        }
    }).bind(this);
};