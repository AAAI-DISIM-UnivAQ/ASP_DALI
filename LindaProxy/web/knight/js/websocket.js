$(function() {
    socket = {
        init : function(){
            this.ws = new WebSocket('ws://localhost:8888/ws');
            this.ws.onclose = this.ws.onerror = (function(){
                this.ws.close()
                delete this.ws;
                setTimeout((function(){
                    this.init();
                }).bind(this), 1000);
            }).bind(this);
            this.ws.onmessage = this.onmessage;
        },
        onmessage : function() {
            
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
});