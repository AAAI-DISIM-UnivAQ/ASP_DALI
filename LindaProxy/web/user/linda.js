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
m = 'foDSmessage\x00\x07S:\x00\x02Auradigitallife\x00I3010\x00Aagente1\x00S:\x00\x02Auradigitallife\x00I3010\x00Auser\x00Aitalian\x00]Ssend_message\x00\x05I3\x00Agino\x00I3\x00Sciao\x00\x05"\x04\x03\x00[Aasd\x00[[Adentro\x00[[Adentrodentro\x00]]]Agiulio\x00I3333\x00Apippo\x00[Aciao\x00[I3333\x00[I0\x00[Asenieo\x00[[I0\x00[Aciao\x00]]Auser\x00'

/*
 * \x00 divide
 * S funzione
 * S: tupla
 * I intero
 * A atomo
 */
first = function(m) {
    if(m.charAt(m.length-1 === String.fromCharCode(0))){
        m = m.substring(3, m.length-1);
    } else {
        m = m.slice(3);
    }
    return linda(m).stringa;
}

linda = function(m) {
    var c0 = m.charAt(0);
    var message;
    
    switch (c0) {
        case 'S':
            if(m.charAt(1) === ":"){
                //tupla
//                console.log("tupla");
                m = m.slice(3);
                message = lindaTupla(m);
            } else {
                //funzione
//                console.log("funzione");
                m = m.slice(1);
                message = lindaFunzione(m);
            }
            break;
        case 'I':
        case 'A':
            //atomo
//            console.log("atomo");
            m = m.slice(1);
            message = lindaAtomo(m);
            break;
        case ']':
        case '[':
        case '"':
//            console.log("quadra");
            message = lindaLista(m);
            break;
        default:
            console.log(m, m.charCodeAt(0))
    }
    
    return message;
}

lindaFunzione = function(m) {
    var posSeparator = m.search(String.fromCharCode(0))
    var nameFunction = m.substring(0, posSeparator)+'(';
    m = m.slice(posSeparator+1);
    
    var numParameters = m.charCodeAt(0);
    m = m.slice(1);
    
    for(var i=0; i<numParameters; i++) {
        var elemento = linda(m);
        nameFunction = nameFunction + elemento.stringa +',';
        m = elemento.old;
    }
    
    return {
        old : m,
        stringa : nameFunction.substring(0, nameFunction.length-1)+')'
    };
}

lindaTupla = function(m) {
    var tupla = "";
    var numParameters = m.charCodeAt(0);
    m = m.slice(1);
    
    for(var i=0; i<numParameters; i++) {
        var elemento = linda(m);
        tupla = tupla + elemento.stringa + ':';
        m = elemento.old;
    }
    return {
        old : m,
        stringa : tupla.substring(0, tupla.length-1)
    };
}

lindaAtomo = function(m) {
    var posSeparator = m.search(String.fromCharCode(0));
    posSeparator = (posSeparator !== -1) ? posSeparator : m.length;
    
    var atomo = m.substring(0, posSeparator);
    m = m.slice(posSeparator+1);

    return {
        old : m,
        stringa : atomo
    };
}

lindaLista = function(m) {
    //[Aciao\x00[I3333\x00[Asenieo\x00]
    var result="";
    while(m.charAt(0) === '[' || m.charAt(0) === '"') {
        if(m.charAt(0) === '[') {
            m = m.slice(1);
            var elemento = linda(m);
            result += elemento.stringa+',';
            m = elemento.old;
        } else {
            for(var j=1; m.charCodeAt(j) !== 0; j++){
                result += m.charCodeAt(j)+',';
            }
            m = m.slice(j+1);
        }
    }
    
    return {
        old : m.slice(1),
        stringa : "["+result.substring(0, result.length-1)+']'
    };
}

date = new Date().getTime();
console.log(pippo = first(m));
console.log((new Date().getTime())-date);
debugger;