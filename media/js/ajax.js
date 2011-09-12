/**
 * Created by PyCharm.
 * User: yuri
 * Date: 07/07/11
 * Time: 15:08
 * To change this template use File | Settings | File Templates.
 */

String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
}

var requisicoes = 0
var requisicao = null
var getGroupsT = 0
var getHostsT = 0

function interfaceUpdater(sid){
    var date = new Date()
    var agora = date.toISOString()
    requisicao = $.ajax({
        type: "GET",
        url: "/comands/",
        dataType: "json",
        data : {
                'sid' : sid,
                'nc' : agora
        },
        success: function(retorno){
            console.log(var_dump(retorno))
            if (retorno.getGroup == 1){
                if (getGroupsT == 0){
                    console.log("Entrou getGroups")
                    getGroupsT = 1
                    getGroups(sid)
                    getGroupsT == 0
                }
            }
            if (retorno.getHost == 1){
                if (getGroupsT == 0 && getHostsT == 0){
                    console.log("Entrou getHosts")
                    getHostsT = 1
                    getHosts(sid, retorno)
                }
            }
            if (retorno.updateHosts && retorno.getHost == 1 && getHostsT == 0 && getGroupsT == 0){
                $.each(retorno.updateHosts, function(key, hid){
                    console.log("Entrou updateHost")
                    updateHost(hid,sid)
                })
            }
            if (retorno.ping){
                console.log("Entrou updatePing")
                updatePing(retorno.ping, sid)
            }else{
                retornaNormal()
            }
            $("#quantidade_hosts").text(retorno.quantidadeHosts)
            $("#quantidade_hosts_on").text(retorno.quantidadeHosts - retorno.quantidadeHostsOff)
            $("#quantidade_hosts_off").text(retorno.quantidadeHostsOff)
        }
    })
    setTimeout("interfaceUpdater('"+ sid +"')",5000);
}

function getGroups(sid){
    console.log("getGroups")
    var date = new Date()
    var agora = date.toISOString()
    requisicao = $.ajax({
        type: "GET",
        url: "/getGroups/",
        dataType: "json",
        data : {
                'sid' : sid,
                'nc' : agora
        },
        success: function(retorno){
            requisicoes = 0
            res = ""
            $.each(retorno, function(key, obj){
                if (key.startsWith("addGroup#_#")){
                    id = key.split("#_#")
                    if (!document.getElementById("group_" + id[1])){
                        group = obj.split("#_#")
                        js_onclick = 'abreFecha("hosts_group_'+ id[1]+'")'
                        $("body").append("<div id='group_" + id[1] + "' class='group'><h1 onclick='javascript: "+ js_onclick +"'>"+ group[0] +"</h1><div id='hosts_group_"+ id[1] +"'></div></div>")
                        if(id[2]=="hidden"){
                            $("#group_" + id[1]).append("<input type=\"hidden\" id=\"group_" + id[1]+"_show\" value=\"1\" />");
                            $('#hosts_group_'+ id[1]).toggle(false)
                        }else{
                            $("#group_" + id[1]).append("<input type=\"hidden\" id=\"group_" + id[1]+"_show\" value=\"0\" />");
                            $('#hosts_group_'+ id[1]).toggle(true)
                        }
                    }
                }
            })
            getGroupsT = 0
            getHosts(sid,'')
        }
    })
}

function getHosts(sid, old_retorno){
    console.log("getHosts")
    var date = new Date()
    var agora = date.toISOString()
    requisicao = $.ajax({
        type: "GET",
        url: "/getHosts/",
        dataType: "json",
        data : {
                'sid' : sid,
                'nc' : agora
        },
        success: function(retorno){
            requisicoes = 0
            res = ""
            retorno2 = retorno
            $.each(retorno, function(key, obj){
                if (key.startsWith("addHost#_#")){
                    id = key.split("#_#")
                    obj = obj.split("#_#")
                    if (!document.getElementById("host_" + id[2])){
                        $("#hosts_group_" + id[1]).append("<a href='#' id='a_host_" + id[2] + "' class='openModal' title='" + obj[0] + "' >" +
                            "<div class='hosts'  onclick='javascript:openModal(this)' id='host_" + id[2] +"'>" +
                            "<h5 id='name_" + id[2] + "' class='hostname'>" + obj[0] + "</h5>" +
                            "<img id='host_img_" + id[2] + "' class='host' src='/media/img/host.png' />" +
                            "<img id='stat_" + id[2] + "' class='state' src='/media/img/state0.png' />" +
                            "<h5 id='ip_" + id[2] + "' class='hostip'>" + obj[1] + "</h5>" +
                        "</div>"+
                        "</a>")
                    }
                }
            })
            getHostsT = 0
            if (old_retorno.updateHosts){
                $.each(old_retorno.updateHosts, function(key, hid){
                    console.log("Entrou updateHost")
                    updateHost(hid,sid)
                })
            }
        }
    })
}

function openModal(id){
    var host_id = id.id.split("_")
    host_id = host_id[1]
    $.modal(
        "<div class='simplemodal-container'><h1>" + host_id + "</h1></div>",
        {
            overlayClose:true
        }
    )
}

function updateHost(host_id, sid){
    console.log("updateHost - " + host_id)
    if (document.getElementById("host_"+host_id)){
        var date = new Date()
        var agora = date.toISOString()
        console.log("Atualizando host: "+ host_id)
        $.ajax({
            type: 'GET',
            url : '/getHost/',
            data: {
                x   : agora,
                hid : host_id
            },
            success: function(retorno){
                console.log("Atualizando...")
                destroyDiv(host_id)
                getHosts(sid, '')
            }
        })
    }else{
        console.log("Host nao encontrado: "+ host_id)
        getHosts(sid,"")
    }
}

function updatePing(ping, sid) {
    console.log("updatePing")
    var hosts = new Array()
    var i = 0
    $.each(ping, function(host,min){
        hosts[i] = host
        console.log(host + " ping: "+min)
        if (document.getElementById("host_"+host)){
            console.log($("#host_"+host).parent().parent())
            $("#host_"+host).parent().parent().toggle(true)
            if(min <= 5){
                $("#stat_"+host).attr("src","/media/img/state"+min+".png")
            }else{
                console.log("maior que 5")
                $("#stat_"+host).attr("src","/media/img/state5.png")
                $("#host_img_"+host).attr("src","/media/img/hostoffline.png")
            }
        }else{
            console.log("host: " + host +" nao encontrado")
        }
        i = i + 1
    })
    console.log("HOSTS UPDATE PING")
    console.log(hosts)
    $.each($('img[class="state"]'), function(key, val){
        var id = $(val).attr("id")
        var host_id = id.split("_")
        var onLine = true
        for (var x = 0;x <= (hosts.length - 1); x++){
            if (hosts[x] == host_id[1]){
                onLine = false
            }
        }
        if (onLine == true){
            console.log("host online: " + host_id[1])
            $("#stat_" + host_id[1]).attr("src","/media/img/state0.png")
            $("#host_img_" + host_id[1]).attr("src","/media/img/host.png")
        }
    })
}

function retornaNormal(){
    console.log("Todos OnLine")
    a = $('img[class="state"][src!="/media/img/state0.png"]')
    $.each(a, function(key, val){
        $(val).attr("src","/media/img/state0.png")
    })
    a = $('img[class="host"][src!="/media/img/hostoffline.png"]')
    $.each(a, function(key, val){
        id_pai = $(val).parent().parent().parent().parent().attr("id")
        if($("#"+id_pai + "_show").attr("value") == 1){
            $(val).parent().parent().parent().toggle(false)
        }else{
            $(val).parent().parent().parent().toggle(true)
        }
        $(val).attr("src","/media/img/host.png")
    })
}

function destroyDiv(div_id) {
    console.log("Removendo: host_" + div_id)
   $("div").remove("#host_"+div_id)
}

function var_dump(data,addwhitespace,safety,level) {
    var rtrn = '';
    var dt,it,spaces = '';
    if(!level) {level = 1;}
    for(var i=0; i<level; i++) {
       spaces += '   ';
    }//end for i<level
    if(typeof(data) != 'object') {
       dt = data;
       if(typeof(data) == 'string') {
          if(addwhitespace == 'html') {
             dt = dt.replace(/&/g,'&amp;');
             dt = dt.replace(/>/g,'&gt;');
             dt = dt.replace(/</g,'&lt;');
          }//end if addwhitespace == html
          dt = dt.replace(/\"/g,'\"');
          dt = '"' + dt + '"';
       }//end if typeof == string
       if(typeof(data) == 'function' && addwhitespace) {
          dt = new String(dt).replace(/\n/g,"\n"+spaces);
          if(addwhitespace == 'html') {
             dt = dt.replace(/&/g,'&amp;');
             dt = dt.replace(/>/g,'&gt;');
             dt = dt.replace(/</g,'&lt;');
          }//end if addwhitespace == html
       }//end if typeof == function
       if(typeof(data) == 'undefined') {
          dt = 'undefined';
       }//end if typeof == undefined
       if(addwhitespace == 'html') {
          if(typeof(dt) != 'string') {
             dt = new String(dt);
          }//end typeof != string
          dt = dt.replace(/ /g,"&nbsp;").replace(/\n/g,"<br>");
       }//end if addwhitespace == html
       return dt;
    }//end if typeof != object && != array
    for (var x in data) {
       if(safety && (level > safety)) {
          dt = '*RECURSION*';
       } else {
          try {
             dt = var_dump(data[x],addwhitespace,safety,level+1);
          } catch (e) {continue;}
       }//end if-else level > safety
       it = var_dump(x,addwhitespace,safety,level+1);
       rtrn += it + ':' + dt + ',';
       if(addwhitespace) {
          rtrn += '\n'+spaces;
       }//end if addwhitespace
    }//end for...in
    if(addwhitespace) {
       rtrn = '{\n' + spaces + rtrn.substr(0,rtrn.length-(2+(level*3))) + '\n' + spaces.substr(0,spaces.length-3) + '}';
    } else {
       rtrn = '{' + rtrn.substr(0,rtrn.length-1) + '}';
    }//end if-else addwhitespace
    if(addwhitespace == 'html') {
       rtrn = rtrn.replace(/ /g,"&nbsp;").replace(/\n/g,"<br>");
    }//end if addwhitespace == html
    return rtrn;
 }//end function var_dump

function abreFecha(element){
    if($("#"+$("#"+element).parent().attr("id")+"_show").attr("value")==1){
        $("#"+$("#"+element).parent().attr("id")+"_show").attr("value","0")
    }else{
        $("#"+$("#"+element).parent().attr("id")+"_show").attr("value","1")
    }
    $("#"+element).toggle('slow')
}