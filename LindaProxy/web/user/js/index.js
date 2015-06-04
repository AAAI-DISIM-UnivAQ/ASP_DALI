$(document).ready(function(){
    //oggetti di appoggio ---------------------------------------------------*/
    var utils = {
        regex : {
            stringa : /^[^\s]+$/i,
            funzione : /^[a-z0-9_]+[ ]*\((.*)\)[ ]*$/i
        },
        validate : function(valore, tipo){
            valore = valore.trim();
            switch (tipo){
                case "stringa":
                    return this.regex.stringa.test(valore);
                case "lindaMessage":
                    return lindaValidator.validate('['+valore+']');
            }
        }
    };
    var socket = {
        init : function(){
            this.ws = new WebSocket('ws://192.168.1.104:8888/ws');
            this.ws.onclose = this.ws.onerror = (function(){
                setTimeout((function(){
                    this.init();
                }).bind(this), 1000);
            }).bind(this);
            this.ws.onmessage = function(data) {
                console.log(data);
            };
        },
        isOpen : function(){
            return this.ws.readyState === this.ws.OPEN;
        },
        send : function(value) {
            if(!this.isOpen()) {
                return false;
            }
            
            if(typeof value === "object") {
                value = JSON.stringify(value);
            }
            this.ws.send(value);
            return true;
        },
        close : function() {
            this.ws.onclose = this.ws.onerror = null;
            this.ws.close();
        }
    };
    
    //implpementazione -------------------------------------------------------*/
    socket.init();
    
    var templateItem;
    $.get('template/itemListMessaggio.html', function(data) {
        templateItem = _.template(data);
    });
    
    var $mittente = $('input#mittente');
    var $destinatario = $('input#destinatario');
    var $funzione = $('select#funzione');
    var $messaggio = $('input#messaggio');
    var $sendButton = $('#sendButton');
    var $resetButton = $('#resetButton');
    
    var $storicoList = $('ul#storicoList');
    
    $sendButton.on("click", function() {
        var messaggio = {
            sender : $mittente.val().trim(),
            destination : $destinatario.val().trim(),
            typefunc : $funzione.val().trim(),
            message : $messaggio.val().trim()
        };
        
        if(!utils.validate(messaggio.sender, "stringa")) {
            alert("Scrivi correttamente il nome dell'agente mittente");
            return;
        }
        if(!utils.validate(messaggio.destination, "stringa")) {
            alert("Scrivi correttamente il nome dell'agente destinatario");
            return;
        }
        if(!utils.validate(messaggio.message, "lindaMessage")) {
            alert("Scrivi correttamente il messaggio");
            return;
        }
        
        if(!socket.send(messaggio)) {
            alert("Connessione caduta con il server, riprova tra poco");
            return;
        }
        
        if(templateItem) {
            $storicoList.prepend(templateItem(messaggio));
        };
    });
    
    $resetButton.on("click", function() {
        $mittente.val("");
        $destinatario.val("");
        $messaggio.val("");
    });
});