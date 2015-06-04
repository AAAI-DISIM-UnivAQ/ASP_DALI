'''
 PyDALI proxyLinda module to encapsulate DALI-ASP integration
 in the ASP solver case study

 Licensed with Apache Public License
 by AAAI Research Group
 Department of Information Engineering and Computer Science and Mathematics
 University of L'Aquila, ITALY
 http://www.disim.univaq.it
'''

import psutil, subprocess, os, re

DLV_CMD = 'dlv'
#DLV_CMD = 'dlv'+os.sep+'dlv.mingw.exe'  WINDOWS

class AspSolver:

    def __init__(self, srcdata, srsprogramfile, solver=DLV_CMD):
        self.cmd = solver
        self.process = None
        self.srsprogramfile = srsprogramfile
        self.srcdata = srcdata
        self.result = None

    def run(self):
        self.f = open('dlvresult/result.txt', 'w')
        self.process = subprocess.Popen([self.cmd, '-n=1', '-stats', '-filter=move', self.srcdata, self.srsprogramfile], stdout=self.f)
        print 'Running ' + self.srsprogramfile + '  ' + self.srcdata,'at pid', self.process.pid

    def is_alive(self):
        if self.process:
            status = psutil.Process(pid=self.process.pid).status()
            print self.process.pid, status
            if status=='zombie':
                self.process = None
                return False
            return psutil.pid_exists(self.process.pid)
        else:
            return False

    def readresult(self):
        self.f.close()
        self.f = open("dlvresult/result.txt", "r")
        result = self.f.read()
        print result
        self.f.close()
        # try:
        pattern = re.compile(ur'{(((move\(([0-9]{1,2},)+[0-9]{1,2}\),)\s?)*move\(([0-9]{1,2},)+[0-9]{1,2}\))}', re.IGNORECASE)
        match = re.findall(pattern, result)
        self.result = match[0][0].split(', ')

    def getresult(self):
        return self.result

    def terminate(self):
        if self.process and self.is_alive():
            self.process = None
        self.f.close()







