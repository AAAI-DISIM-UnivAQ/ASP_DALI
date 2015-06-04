:- use_module(library(sockets)).

net_ip(localhost).
net_port(3333).

open_web_socket(Stream):- net_ip(IP), net_port(PORT), socket_client_open(IP:PORT, Stream, [type(text)]).
close_web_socket(Stream):- close(Stream).

ack:- agent(M), open_web_socket(Stream),
                write(Stream,M), write(Stream,'_.._'),
                current_identifier(Identifier),
                write(Stream,Identifier),
                close_web_socket(Stream).

sendData(X) :- agent(M), open_web_socket(Stream),
               write(Stream,M), write(Stream,'_.._'),
               current_identifier(Identifier),
               write(Stream,Identifier), write(Stream,'_.._'),
               write(Stream,X),
               close_web_socket(Stream).
sendData(X, Y) :- agent(M), open_web_socket(Stream),
               write(Stream,M), write(Stream,'_.._'),
               current_identifier(Identifier),
               write(Stream,Identifier), write(Stream,'_.._'),
               write(Stream,X), write(Stream,'_.._'),
               write(Stream,Y),
               close_web_socket(Stream).

