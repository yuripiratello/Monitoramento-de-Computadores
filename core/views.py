import datetime
from django.shortcuts import render_to_response, HttpResponse, redirect
from django.template import RequestContext
from django.core.serializers import serialize
from django.contrib.auth.decorators import login_required
import json
from django.utils.encoding import smart_unicode, smart_str

from models import *

@login_required()
def index(request):
    return render_to_response('index.html', { 'request' : request,'sessionid':request.COOKIES['sessionid'],}, context_instance=RequestContext(request) )

def comands(request):
    """
        Aqui serao verificados os dados que restam enviar a tela principal.
        Verifica-se tambem se algum grupo foi alterado, ou host.
    """
    #Declara variaveis
    #print request.session.items()
    #print request
    comands_json = {}
    #Carrega os Groups e Hosts do banco.
    groups = Group.objects.all().order_by('-created')
    hosts = Host.objects.all().order_by('-created')
    #Verifica se as chaves existem na sessao
    if not request.session.has_key('last_group_sent'):
        comands_json['getGroup'] = 0
        print "nao existe last_group_sent"
        request.session['last_group_sent'] = datetime.datetime.today()
        comands_json['getGroup'] = 1

    if not request.session.has_key('last_host_sent'):
        comands_json['getHost'] = 0
        print "nao existe last_host_sent"
        request.session['last_host_sent'] = datetime.datetime.today()
        comands_json['getHost'] = 1

    if not 'getGroup' in comands_json:
        groups = Group.objects.filter(last_update__gte=(request.session['last_group_sent'] - datetime.timedelta(seconds=5)), created__lte = request.session['last_group_sent'])
        if groups:
            comands_json['updateGroups'] = []
            for group in groups:
                comands_json['updateGroups'].append(group.id)
            comands_json['getGroup'] = 1
        request.session['last_group_sent'] = datetime.datetime.now()


    if not 'getHost' in comands_json:
        hosts = Host.objects.filter(last_update__gte=(request.session['last_host_sent'] - datetime.timedelta(seconds=5)), created__lte = request.session['last_host_sent'])
        if hosts:
            comands_json['updateHosts'] = []
            for host in hosts:
                comands_json['updateHosts'].append(host.hid)
            comands_json['getHost'] = 1
        request.session['last_host_sent'] = datetime.datetime.now()


    #Testa o ping
    hosts = Host.objects.all()
    comands_json['quantidadeHosts'] = 0
    comands_json['quantidadeHostsOff'] = 0
    comands_json['quantidadeHosts'] = len(hosts)
    if hosts:
        for host in hosts:
            last_ping = Information.objects.filter(plugin_key='ping',hid=host.pk).order_by('-created_at')
            if last_ping:
                last_ping_time = datetime.datetime.now() - last_ping[0].created_at
                if last_ping_time.seconds/60 > 0:
                    if not "ping" in comands_json:
                        comands_json['ping'] = {}
                    min = last_ping_time.seconds/60
                    comands_json['ping'][host.hid] = min
                    if 'quantidadeHostsOff' in comands_json:
                        comands_json['quantidadeHostsOff'] = int(comands_json['quantidadeHostsOff']) + 1
                    else:
                        comands_json['quantidadeHostsOff'] =  1
    
    return HttpResponse(json.dumps(comands_json), mimetype="application")

def getGroups(request):
    data = {}
    groups = Group.objects.all().order_by('-name',)
    for group in groups:
        if not group.show:
            data['addGroup#_#' + str(group.pk) + "#_#hidden"] = smart_unicode(group.name) + "#_#" + smart_unicode(group.description)
        else:
            data['addGroup#_#' + str(group.pk)] = smart_unicode(group.name) + "#_#" + smart_unicode(group.description)
    data_json = json.dumps(data)
    return HttpResponse( data_json ,mimetype="application/json")

def getHosts(request):
    data = {}
    hosts = Host.objects.all()
    for host in hosts:
        data['addHost#_#' + smart_unicode(host.group.pk) + "#_#" + smart_unicode(host.pk)] = smart_unicode(host.name) + "#_#" + smart_unicode(host.ip)
    data_json = json.dumps(data)
    return HttpResponse(data_json, mimetype="application/json")

def closeSession(request):
    print "Bye!"
    from django.contrib.auth.views import logout
    import settings
    logout(request,settings.LOGIN_URL)
    return HttpResponse('')

def getHost(request):
    hid = request.GET['hid']
    host = Host.objects.filter(pk=hid)
    host_json = serialize("json",host)
    return HttpResponse(host_json, mimetype="application/json")