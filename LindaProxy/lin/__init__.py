'''
 PyDALI lin module to encapsulate Linda tuple space message handler
 in the ASP solver case study

 Licensed with Apache Public License
 by AAAI Research Group
 Department of Information Engineering and Computer Science and Mathematics
 University of L'Aquila, ITALY
 http://www.disim.univaq.it
'''

__author__ = 'AAAI-DISIM@UnivAQ'

import re

def param_get(message):
    if message[:2] == "S:":
        n_param = ord(message[3])
        init = 4
        fres = ""
        for _ in range(n_param):
            res, l = param_get(message[init:])
            init += l
            fres += res + ":"
        fres = fres[:-1]
        return fres, init
    elif message[0] == "S":
        name = message[1:].split(chr(0), 1)[0]
        n_param = ord(message[len(name) + 2])
        init = len(name) + 3

        fres = name + "("
        for _ in range(n_param):
            res, l = param_get(message[init:])
            init += l
            fres += res + ","
        fres = fres[:-1] + ")"
        return fres, init
    elif message[0] == "A" or message[0] == "I":
        param = message.split(chr(0))[0]
        return param[1:], len(param) + 1
    elif message[0] == "[" or message[0] == "]" or message[0] == '"':
        fres = ""
        init = 0
        while message[init] == "[" or message[init] == '"':
            if message[init] == "[":
                res, l = param_get(message[init + 1:])
                fres += res + ","
                init += l + 1
            else:
                init += 1
                while ord(message[init]) != 0:
                    fres += str(ord(message[init])) + ","
                    init += 1
                init += 1
        return '['+fres[:-1]+']', init + 1
    else:
        print 'def', message
        return "$$", 1

def read_message(message):
    res, length = param_get(message[3:])
    return res

utils = {
    'charSeparator': '\x00'
}
def spitParameters(par, sep):
    block = 0
    param = ""
    parameters = []
    for x in par:
        if x == sep and block == 0:
            parameters.append(param.strip())
            param = ""
        else:
            if x == '(' or x == "[":
                block += 1
            elif x == ')' or x == "]":
                block -= 1
            param += x
    if param.strip() != "":
        parameters.append(param.strip())
    return parameters
utils['spitParameters'] = spitParameters
regex = {
    'atomo': re.compile(ur'^([a-z0-9 _\-\.]+)$', re.IGNORECASE),
    'funzione': re.compile(ur'^[a-z0-9_]+[ ]*\((.*)\)[ ]*$', re.IGNORECASE),
    'lista': re.compile(ur'^[ ]*\[(.*)\][ ]*$', re.IGNORECASE),
    'tupla': re.compile(
        ur'^(([a-z0-9 _\-\.]+|[a-z0-9_\-\.]+[ ]*\([a-z 0-9\-\._\:\(\)\[\]\,]*\)[ ]*|[ ]*\[[a-z 0-9_\-\.\:\(\)\[\]\,]*\][ ]*)\:)+([a-z0-9 _\-\.]+|[a-z0-9_]+[ ]*\([a-z 0-9_\-\.\:\(\)\[\]\,]*\)[ ]*|[ ]*\[[a-z 0-9_\-\.\:\(\)\[\]\,]*\][ ]*)$',
        re.IGNORECASE
    )
}
utils['regex'] = regex

def new_get_args(m):
    m = m.strip()
    ser = regex['atomo'].match(m)
    if ser is not None:
        atomo = ser.group(0)
        if unicode(atomo).isnumeric():
            return "I"+atomo+'\x00'
        else:
            return "A"+atomo+'\x00';
    ser = regex['funzione'].match(m)
    if ser is not None:
        name = "S" + m[:m.index("(")]+"\x00"

        body_result = ""
        params = utils['spitParameters'](ser.group(1), ',')
        for par in params:
            body_result += new_get_args(par)

        return name + chr(len(params))+body_result
    ser = regex['lista'].match(m)
    if ser is not None:
        result = ""
        params = utils['spitParameters'](ser.group(1), ',')

        special_int = False
        for par in params:
            # print par
            if len(par) == 1 and unicode(par).isnumeric() and int(par) > 0:
                if not special_int:
                    result += '"'
                special_int = True
                result += chr(int(par))
            else:
                if special_int:
                   result += '\x00'
                special_int = False
                result += '[' + new_get_args(par)
        if special_int:
           result += '\x00'
        return result + ']'

    ser = regex['tupla'].search(m)
    if ser is not None:
        result = "S:\x00"
        params = utils['spitParameters'](m, ':')

        result += chr(len(params))
        for par in params:
            result += new_get_args(par)
        return result
    print 'peccato', m
    return ""
def write_message(message):
    res = "foD" + new_get_args(message)
    return res

__all__ = ["write_message", "read_message"]

