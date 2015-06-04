var lindaValidator = {
    /*
     * \x00 divide
     * S funzione
     * S: tupla
     * I intero
     * A atomo
     */
    utils : {
        caratteriSpeciali : ['[',']','(',')',',',':'],
        isSpecial : function(c) {
            for(var i in this.caratteriSpeciali) {
                if(c === this.caratteriSpeciali[i]){
                    return true;
                }
            }
            return false;
        },
        charSeparator : String.fromCharCode(0),
        getCharFromCode : function(code) {
    //        return "/x0"+code;
            return String.fromCharCode(code);
        },
        regex : {
            atomo : /^([a-z0-9 _]+)$/i,
            funzione : /^[a-z0-9_]+[ ]*\((.*)\)[ ]*$/i,
            lista : /^[ ]*\[(.*)\][ ]*$/i,
            tupla : /^(([a-z0-9 _]+|[a-z0-9_]+[ ]*\([a-z 0-9_\:\(\)\[\]\,]*\)[ ]*|[ ]*\[[a-z 0-9_\:\(\)\[\]\,]*\][ ]*)\:)+([a-z0-9 _]+|[a-z0-9_]+[ ]*\([a-z 0-9_\:\(\)\[\]\,]*\)[ ]*|[ ]*\[[a-z 0-9_\:\(\)\[\]\,]*\][ ]*)$/i
        },
        splitParameters : function(stringa, separator) {
            var parameters = [];
            var param = "";
            var block = 0;
            for(var i in stringa) {
                var c = stringa.charAt(i);
                if(block === 0 && c === separator) {
                    parameters.push(param.trim());
                    param = "";
                } else {
                    if(c === "(" || c === "[") {
                        block++;
                    } else if(c === ")" || c === "]") {
                        block--;
                    }
                    param += c;
                }
            }
            if(param.trim() !== "") {
                parameters.push(param.trim());
            }
            return parameters;
        }
    },
    validate : function(m) {
        m = m.trim();
        var message = false;

        if(this.utils.regex.atomo.test(m)) {
            message = true;
        } 
        else if(this.utils.regex.funzione.test(m)){
            message = this.lindaFunzione(m);
        }
        else if(this.utils.regex.lista.test(m)){
            message = this.lindaLista(m);
        }
        else if(this.utils.regex.tupla.test(m)){
            message = this.lindaTupla(m);
        } else {
            console.log(m, "    non so che è");
        }

        return message;
    },
    lindaFunzione : function(m) {
        var params = m.match(this.utils.regex.funzione)[1];
        params = this.utils.splitParameters(params, ',');
        
        for(var i in params) {
            if(!this.validate(params[i])){
                return false;
            }
        }
        
        return true;
    },
    lindaLista : function(m) {
        var params = m.match(this.utils.regex.lista)[1];
        params = this.utils.splitParameters(params, ',');
        
        for(var i in params) {
            if(!this.validate(params[i])){
                return false;
            }
        }

        return true;
    },
    lindaTupla : function(m) {
        var params = this.utils.splitParameters(m, ':');

        for(var i in params) {
            if(!this.validate(params[i])){
                return false;
            }
        }

        return true;
    }
};