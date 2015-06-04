//m = "foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x02Sciao\x00\x01Agiulio\x00Auser\x00"
//m = "foDSmessage\x00\x02Agiorgio\x00Agiulio\x00";

//originale = 'message(uradigitallife:3010,agente1,uradigitallife:3010,user,italian,[],send_message(ciao(giulio,3333,pippo,[ciao,3,senieo]),user))'
//m = 'foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x02Sciao\x00\x04Agiulio\x00I3333\x00Apippo\x00[Aciao\x00"\x03\x00[Asenieo\x00]Auser\x00'

//originale = 'message(uradigitallife:3010,agente1,uradigitallife:3010,user,italian,[],send_message(ciao(giulio,3333,pippo,[ciao,3333,senieo]),user))'
//m = 'foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x02Sciao\x00\x04Agiulio\x00I3333\x00Apippo\x00[Aciao\x00[I3333\x00[Asenieo\x00]Auser\x00'

//originale = 'message(uradigitallife:3010,agente1,uradigitallife:3010,user,italian,[],send_message(ciao(giulio,3333,pippo,[ciao,3333,senieo,[ciao]]),user))'
//m = 'foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x02Sciao\x00\x04Agiulio\x00I3333\x00Apippo\x00[Aciao\x00[I3333\x00[Asenieo\x00[[Aciao\x00]]Auser\x00'


//originale = 'message(uradigitallife:3010,agente1,uradigitallife:3010,user,italian,[],send_message(3,gino,3,ciao([4,3,asd,[dentro,[dentrodentro]]],giulio,3333,pippo,[ciao,3333,senieo,[ciao]]),user))'
//m = 'foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x05I3\x00Agino\x00I3\x00Sciao\x00\x05"\x04\x03\x00[Aasd\x00[[Adentro\x00[[Adentrodentro\x00]]]Agiulio\x00I3333\x00Apippo\x00[Aciao\x00[I3333\x00[Asenieo\x00[[Aciao\x00]]Auser\x00'

originale = 'message(uradigitallife:3010,agente1,uradigitallife:3010,user,italian,[],send_message(3,gino,3,ciao([4,3,asd,[dentro,[dentrodentro]]],giulio,3333,pippo,[ciao,3333,0,senieo,[0,ciao]]),user))'
//m = 'foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x05I3\x00Agino\x00I3\x00Sciao\x00\x05"\x04\x03\x00[Aasd\x00[[Adentro\x00[[Adentrodentro\x00]]]Agiulio\x00I3333\x00Apippo\x00[Aciao\x00[I3333\x00[I0\x00[Asenieo\x00[[I0\x00[Aciao\x00]]Auser\x00'

//originale = "[pippo,falso,bello]";
//originale = "message([pippo,falso,bello], franco(saluti,pippo(salve), 54),franco)";
//originale = "pippo:franco:scemo";
//originale = "message()";
//originale = "pappone:franco";

/*
 * \x00 divide
 * S funzione
 * S: tupla
 * I intero
 * A atomo
 */
var utils = {
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
};

first = function(m) {
    return "foD"+linda(m);
};
linda = function(m) {
    m = m.trim();
    var message = "";
    
    if(utils.regex.atomo.test(m)) {
        message = lindaAtomo(m);
    } 
    else if(utils.regex.funzione.test(m)){
        message = lindaFunzione(m);
    }
    else if(utils.regex.lista.test(m)){
        message = lindaLista(m);
    }
    else if(utils.regex.tupla.test(m)){
        message = lindaTupla(m);
    } else {
        console.log(m, "    non so che è");
    }
    
    return message;
};
lindaAtomo = function(m) {
    var atomo = m.match(utils.regex.atomo)[0];
    
    if(isNaN(parseInt(atomo))) {
        atomo = "A"+atomo;
    } else {
        atomo = "I"+atomo;
    }
    
    return atomo+utils.charSeparator;
};
lindaFunzione = function(m) {
    var posSeparator = m.search(/\(/);
    var nameFunction = "S"+m.substring(0, posSeparator)+utils.charSeparator;
    var bodyFunction = "";
    
    var parametersOriginal = m.match(utils.regex.funzione)[1];
    parametersOriginal = utils.splitParameters(parametersOriginal, ',');
    
    var numParameters = parametersOriginal.length;
    for(var i in parametersOriginal) {
        bodyFunction += linda(parametersOriginal[i]);
    }
    return nameFunction+utils.getCharFromCode(numParameters)+bodyFunction;
};
lindaLista = function(m) {
    var result = "";
    var parametersOriginal = m.match(utils.regex.lista)[1];
    parametersOriginal = utils.splitParameters(parametersOriginal, ',');
    
    var interi = false;
    for(var i in parametersOriginal) {
        var c = parametersOriginal[i];
        var parseC = (parametersOriginal[i].length === 1) ? parseInt(c) : NaN;
        
        if(!isNaN(parseC) && parseC > 0) {
            if(!interi) {
                result += '"';
            }
            interi = true;
            result += utils.getCharFromCode(parseC);
        } else {
            if(interi) {
                result += utils.charSeparator;
            }
            interi = false;
            result += '['+linda(parametersOriginal[i]);
        }
    }
    
    return result+']';
};
lindaTupla = function(m) {
    var result = "S:"+utils.charSeparator;
    var parametersOriginal = utils.splitParameters(m, ':');
    
    result += utils.getCharFromCode(parametersOriginal.length);
    
    for(var i in parametersOriginal) {
        result += linda(parametersOriginal[i]);
    }
    
    return result;
};



date = new Date().getTime();
console.log(pippo = first(originale));
console.log((new Date().getTime())-date);
debugger;