$(function() {
    var container = $("#container");
    var consoleAgent = $("#console");
    var consoleText = consoleAgent.find("#consoletext");
    var content = $("#content");
    
    consoleAgent.height((container.innerHeight()-40)*0.35);
    content.height((container.innerHeight()-40)*0.65);
//    console.height(container.innerHeight()/3.5);
//    content.height(Math.ceil(container.innerHeight()/1.42)-40);

    mpixi = new MYPIXI($('#chessboard'));
    mpixi.createRenderer();
    mpixi.drowChessboard(6);
    
    var select = $("#chessboardSize");
    slider = $("<div id='slider'></div>").insertAfter(select).slider({
        min: 1,
        max: 7,
        range: "min",
        value: select[ 0 ].selectedIndex + 1,
        slide: function(event, ui) {
            select[ 0 ].selectedIndex = ui.value - 1;
            mpixi.drowChessboard(parseInt(select[0].options[select[0].selectedIndex].value));
        }
    });
    $("#chessboardSize").change(function() {
        slider.slider("value", this.selectedIndex + 1);
        mpixi.drowChessboard(parseInt(select[0].options[select[0].selectedIndex].value));
    });
    
    $("#resetChessboard").on('click', function() {
        select[ 0 ].selectedIndex = 0;
        slider.slider("value", 0);
        mpixi.drowChessboard(6);
        $.ajax({
            type: 'POST',
            url : "http://localhost:8888/api/reset",
            contentType: 'application/json',
            data : JSON.stringify({
                identifier : socket.identifier
            })
        })
    });
    
    $("#createPlan").on('click', function() {
        var size = mpixi.size;
        var forbidden = mpixi.forbidden;
        var newForbidden = [];
        for (var i in forbidden) {
            var forb = forbidden[i];
            
            newForbidden.push({
                x:forb.x + 1,
                y:forb.y + 1
            })
        }
        console.log(newForbidden);
        $.ajax({
            type: 'POST',
            url : "http://localhost:8888/api/plan",
            contentType: 'application/json',
            data : JSON.stringify({
                size : size,
                forbidden : newForbidden,
                identifier : socket.identifier
            }),
            success: function (data, textStatus, jqXHR) {
                console.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                
            }
        })
    });
    
    var consoleKnight = {
        log : function(text) {
            var data = new Date();
            
            consoleText.prepend("<p>"+data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds() + ' - ' + text);
        }
    };
    
    $("#trashConsole").on('click', function(){
        consoleText.html('<p>');
    });
    
    //websocket
    socket.onmessage = function(message) {
        var objMessage = JSON.parse(message.data);
        socket.identifier = objMessage.identifier;
        if (objMessage.type === "console") {
            consoleKnight.log(objMessage.message);
        } else if (objMessage.type === "path") {
            var path = JSON.parse(objMessage.message);
            mpixi.moveHorse(path.path);
        }
    };
    socket.init();
});