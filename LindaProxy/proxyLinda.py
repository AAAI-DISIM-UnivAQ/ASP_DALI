'''
 PyDALI proxyLinda module to encapsulate DALI agent communication
 in the ASP solver case study

 Licensed with Apache Public License
 by AAAI Research Group
 Department of Information Engineering and Computer Science and Mathematics
 University of L'Aquila, ITALY
 http://www.disim.univaq.it
'''

__author__ = 'AAAI-DISIM@UnivAQ'

from aspsolver import AspSolver
import threading

from lin import *

import socket
import json

import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import os
import time
import select

import tornado.platform.twisted
tornado.platform.twisted.install()

from twisted.internet import protocol, reactor

# localmachine = socket.gethostname().lower()
localmachine = 'localhost'
sock = socket.socket()
sock.connect((localmachine, 3010))
# root = '.' + os.sep + os.path.dirname(__file__) + os.sep + 'web'
root = './web'
print 'myroot:', root
system_connection = {}

TMAX = 100  # secondi


def createmessage(sender, destination, typefunc, message):
    m = "message(%s:3010,%s,%s:3010,%s,italian,[],%s(%s,%s))" % (localmachine, destination,
                                                                 localmachine, sender,
                                                                 typefunc, message, sender)
    return m

system_connection = {}


class WSHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def sendConsoleMessage(self, message):
        console = {}
        console['type'] = 'console'
        console['identifier'] = self.identifier
        console['message'] = message
        self.write_message(json.dumps(console))

    def sendPath(self, message):
        console = {}
        console['type'] = 'path'
        console['identifier'] = self.identifier
        console['message'] = message
        self.write_message(json.dumps(console))

    def open(self):
        print 'new connection'
        self.identifier = str(int(time.time()))
        system_connection[self.identifier] = self
        m = createmessage('user', 'agente1', 'send_message', "new_connection(%s)" % self.identifier)
        wrm = write_message(m)
        sock.send(wrm)
        self.sendConsoleMessage('System Ready')

    def on_message(self, message):
        print message
        jsonmessage = json.loads(message)
        # print jsonmessage
        #
        # m = createmessage(jsonmessage['sender'], jsonmessage['destination'], jsonmessage['typefunc'], jsonmessage['message'])
        # print m
        # wrm = write_message(m)
        # print 'message received %s' % message
        # print wrm
        # sock.send(wrm)

        # self.write_message(wrm)

    def on_close(self):
        print 'connection closed'
        system_connection.pop(self.identifier)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        try:
            with open(os.path.join(root, 'knight' + os.sep + 'index.html')) as f:
                self.write(f.read())
        except IOError as e:
            self.write("404: Not Found")


class PlanHandler(tornado.web.RequestHandler):
    def prepare(self):
        if self.request.headers["Content-Type"].startswith("application/json"):
            self.json_args = json.loads(self.request.body)
        else:
            self.json_args = None

    def post(self):
        identifier = self.json_args.get('identifier')
        forbidden = self.json_args.get('forbidden')
        mandatory = self.json_args.get('mandatory')
        size = self.json_args.get('size')

        f = open('dlvprogram/instance.dl', 'w')
        f.write('size(%s). ' % size)
        for forb in forbidden:
            f.write("forbidden(%s,%s). " % (forb.get('x'), forb.get('y')))
        for mark in mandatory:
            f.write("must_reach(%s,%s). " % (mark.get('x'), mark.get('y')))
        f.close()

        m = "instanceReady(%s, %s)" % (size, len(forbidden))
        m = createmessage('user', 'agente1', 'send_message', m)
        wrm = write_message(m)
        sock.send(wrm)
        time.sleep(0.2)

        for forb in forbidden:
            mess = "forbidden_of_problem([%s,%s])" % (forb.get('x'), forb.get('y'))
            m = createmessage('user', 'agente1', 'send_message', mess)
            wrm = write_message(m)
            sock.send(wrm)
            time.sleep(0.2)

        system_connection[identifier].sendConsoleMessage('Request sent to system')



class ResetHandler(tornado.web.RequestHandler):
    def prepare(self):
        if self.request.headers["Content-Type"].startswith("application/json"):
            self.json_args = json.loads(self.request.body)
        else:
            self.json_args = None

    def post(self):
        identifier = self.json_args.get('identifier')
        m = createmessage('user', 'agente1', 'send_message', "new_connection(%s)" % identifier)
        wrm = write_message(m)
        sock.send(wrm)


application = tornado.web.Application([
    (r'/ws', WSHandler),
    (r"/", MainHandler),
    (r"/api/plan", PlanHandler),
    (r"/api/reset", ResetHandler),
    (r"/(.*)", tornado.web.StaticFileHandler, dict(path=root)),
])

temporaryresult = None


class DALI(protocol.Protocol):

    def notifyFailure(self):
        message = 'problem_failed(%s)' % self.currentproblem
        m = createmessage('user', 'agente1', 'send_message', message)
        wrm = write_message(m)
        sock.send(wrm)

    def checkPlan(self):
        if not self.planner.is_alive():
            print 'DLV ended.'
            try:
                self.planner.readresult()
                global temporaryresult
                temporaryresult = self.planner.getresult()
                if self.currentproblem == 1:
                    system_connection[self.identifier].sendConsoleMessage(
                        'Hamiltonian Tour Problem has found a solution')
                elif self.currentproblem == 2:
                    system_connection[self.identifier].sendConsoleMessage('Weak Constraint Problem has found a solution')
                elif self.currentproblem == 3:
                    system_connection[self.identifier].sendConsoleMessage('With Blank Problem has found a solution')

                message = 'new_moves_for_evaluate(%s)' % len(temporaryresult)
                m = createmessage('user', 'agente1', 'send_message', message)
                wrm = write_message(m)
                sock.send(wrm)
                system_connection[self.identifier].sendConsoleMessage('Plan sent to MAS')
            except:
                self.notifyFailure()
        else:
            print 'DLV is alive'
            dt = time.time() - self.t0
            print dt, 'secs elapsed'
            if dt > TMAX:
                self.planner.terminate()
                print 'DLV terminated'
                self.notifyFailure()
            threading.Timer(1, self.checkPlan).start()

    def makePlan(self, problem):
        path = "dlvprogram" + os.sep + "problem%s.dl" % problem
        self.currentproblem = problem
        self.planner = AspSolver("dlvprogram" + os.sep + "instance.dl", path)
        self.planner.run()
        self.t0 = time.time()
        time.sleep(5)

        threading.Timer(1, self.checkPlan).start()

    def dataReceived(self, data):
        # print 'data', data
        fs = data.split('_.._')
        identifier = fs[1]
        self.identifier = identifier
        if len(fs) > 3:
            cmd = fs[2]
            if cmd == 'path':
                strJSONPath = fs[3]
                print strJSONPath
                system_connection[identifier].sendPath(strJSONPath)
            elif cmd == 'as':
                state = fs[3]
                system_connection[identifier].sendConsoleMessage('State of agent: ' + str(state))
        elif len(fs) > 2:
            cmd = fs[2]
            if cmd == 'pr':
                system_connection[identifier].sendConsoleMessage('Plan Received From MAS')
            elif cmd == 'ss1':
                self.makePlan(1)
                system_connection[identifier].sendConsoleMessage('Testing problem Hamiltonian Tour')
            elif cmd == 'ss2':
                self.makePlan(2)
                system_connection[identifier].sendConsoleMessage('Testing problem Weak Constraint')
            elif cmd == 'ss3':
                system_connection[identifier].sendConsoleMessage('Trivial Solution')
            elif cmd == 'ss4':
                self.makePlan(3)
                system_connection[identifier].sendConsoleMessage('Testing problem must reach')
            elif cmd == 'pf1':
                system_connection[identifier].sendConsoleMessage('Hamiltonian Tour Failed')
            elif cmd == 'pf2':
                system_connection[identifier].sendConsoleMessage('Weak Constraint Failed')
            elif cmd == 'pf3':
                system_connection[identifier].sendConsoleMessage('Blank Failed')
            elif cmd == 'pft':
                system_connection[identifier].sendConsoleMessage('Weak Constraint is not optimal')
            elif cmd == 'rs':
                system_connection[identifier].sendConsoleMessage('State of agent: 0')
            elif cmd == 'smr':
                for mv in temporaryresult:
                    mv = mv[5:-1]
                    x1, y1, x2, y2 = mv.split(',')
                    message = 'moves_for_evaluate([%s,%s,%s,%s])' % (x1, y1, x2, y2)
                    m = createmessage('user', 'agente1', 'send_message', message)
                    wrm = write_message(m)
                    sock.send(wrm)
                    time.sleep(0.2)
                system_connection[identifier].sendConsoleMessage('MAS: Waiting for Plan elaboration')
        else:
            system_connection[identifier].sendConsoleMessage('MAS Ready')


class DALIFactory(protocol.Factory):
    def buildProtocol(self, addr):
        return DALI()


if __name__ == "__main__":
    print 'http://localhost:8888/knight/index.html'
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    reactor.listenTCP(3333, DALIFactory())
    tornado.ioloop.IOLoop.instance().start()
