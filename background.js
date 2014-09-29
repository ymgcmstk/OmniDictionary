var msec=10000;
var tempt="";
var sugcontent="open";
var retNum = 64;

function transformZenIntoHan(string1){
    return string1.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
	return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

function sendSuggestion(content1,text1,suggest) {
/*  chrome.omnibox.setDefaultSuggestion({
    description: content1+":"+text1.substring(0,30)
  });

  chrome.omnibox.setDefaultSuggestion({
    description: text1.substring(0,retNum)
  });
*/
  chrome.omnibox.setDefaultSuggestion({
    description: transformZenIntoHan(content1)
  });
  temp=[];
  temp2="　";
  for(i=0;i<Math.ceil(text1.length/retNum);i++){
    temp3="";
    for(j=0;j<i;j++)temp3=temp3+temp2;
    temp.push({content:sugcontent+temp3,description: transformZenIntoHan(text1.substring(retNum*(i),retNum*(i+1)))});
  }
  tempt=content1.substring(0,content1.indexOf("(")-1);
  suggest(temp);	
}


function sendNotification(icon, title, content) {
  var notification = webkitNotifications.createNotification(
    icon,
    title,
    content
  );
  notification.show();
  window.setTimeout(function() {notification.cancel()}, msec);
}


function openNewTab(title) {
  //temptitle=title.substring(0,title.indexOf("(")-1);
  if (title.substring(0,sugcontent.length)===sugcontent){
    var url1="http://ejje.weblio.jp/content/"+tempt;
      chrome.tabs.create({url: url1});
  }
}


function getIndexNum(text,notif,suggest){
  var request= new XMLHttpRequest();
  var url1 = "http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?Dic=EJdict&Word="+text+"&Scope=HEADWORD&Match=STARTWITH&Merge=AND&Prof=XHTML&PageSize=20&PageIndex=0"
  request.open("GET",url1,true);  
  request.onreadystatechange=function(){
    if (request.readyState == 4 && request.status==200){
      var text1=request.responseText;
      var totalnum=text1.substr(text1.indexOf( "Count>" )+6,text1.indexOf( "</Total")-text1.indexOf( "Count>" )-6);
      var index1=text1.substr(text1.indexOf( "<ItemID>" )+8,text1.indexOf( "</ItemID>",text1.indexOf( "<ItemID>" ) )-text1.indexOf( "<ItemID>" )-8);
      getContent(index1,totalnum,text,notif,suggest);
    }
  };
  request.send(null);
}

function getContent(index1,totalnum,text,notif,suggest){
  var url1="http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?Dic=EJdict&Item="+index1+"&Loc=&Prof=XHTML";
  var request= new XMLHttpRequest();
  request.open("GET",url1,true);  
  request.onreadystatechange=function(){
    if (request.readyState == 4 && request.status==200){
      var text1=request.responseText
      var title1=text1.substr(text1.indexOf( "<span class=\"NetDicHeadTitle\">" )+30,text1.indexOf( "</span>" )-text1.indexOf( "<span class=\"NetDicHeadTitle\">" )-30);
      var content1=text1.substr(text1.indexOf( "<div>" )+5,text1.indexOf( "</div>",text1.indexOf( "<div>" ) )-text1.indexOf( "<div>" )-5);
      if (totalnum=="0"){
        title1=text;
        content1="None";
      }
      var title1=title1+" (hit:"+totalnum+")";
      if (notif){
        sendNotification('',title1,content1);
        openNewTab(title1);
      }else{
        sendSuggestion(title1,content1,suggest);
      }
    }
  };
  request.send(null);
}

function getIndexNumJ(text,notif,suggest){
  var request= new XMLHttpRequest();
  var url1 = "http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?Dic=EdictJE&Word="+text+"&Scope=HEADWORD&Match=STARTWITH&Merge=AND&Prof=XHTML&PageSize=20&PageIndex=0"
  request.open("GET",url1,true);  
  request.onreadystatechange=function(){
    if (request.readyState == 4 && request.status==200){
      var text1=request.responseText;
      var totalnum=text1.substr(text1.indexOf( "Count>" )+6,text1.indexOf( "</Total")-text1.indexOf( "Count>" )-6);
      var index1=text1.substr(text1.indexOf( "<ItemID>" )+8,text1.indexOf( "</ItemID>",text1.indexOf( "<ItemID>" ) )-text1.indexOf( "<ItemID>" )-8);
      getContentJ(index1,totalnum,text,notif,suggest);
    }
  };
  request.send(null);
}

function getContentJ(index1,totalnum,text,notif,suggest){
  var url1="http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?Dic=EdictJE&Item="+index1+"&Loc=&Prof=XHTML";
  var request= new XMLHttpRequest();
  request.open("GET",url1,true);  
  request.onreadystatechange=function(){
    if (request.readyState == 4 && request.status==200){
      var text1=request.responseText;
      var title1=text1.substr(text1.indexOf( "<span class=\"NetDicHeadTitle\">" )+30,text1.indexOf( "</span>" )-text1.indexOf( "<span class=\"NetDicHeadTitle\">" )-30);
      var content1=text1.substr(text1.indexOf( "<div>" )+5,text1.lastIndexOf( "</div>")-text1.indexOf( "<div>" )-5);
      content1=content1.replace(/<div>/g,"");
      content1=content1.replace(/<\/div>/g,"");
      if (totalnum=="0"){
        title1=text;
        content1="None";
      }
      var title1=title1+" (hit:"+totalnum+")";
      if (notif){
        sendNotification('',title1,content1);
        openNewTab(title1);
      }else{
        sendSuggestion(title1,content1,suggest);
      }
    }
  };
  request.send(null);
}

function checkAlphabetorNot(text){
  var answer=true;
  for(var i=0;i<text.length;i++){
    if(text.charCodeAt(i)>=256){
      answer=false;
      break;
    }
  }
  return answer;
}


chrome.omnibox.onInputChanged.addListener(function(text,suggest) {
  if (checkAlphabetorNot(text)){
    getIndexNum(text,false,suggest);
  }else{
    getIndexNumJ(text,false,suggest);
  }	  
});


chrome.omnibox.onInputEntered.addListener(function(text,suggest) {
  openNewTab(text);
/*  if (checkAlphabetorNot(text)){
    getIndexNum(text,true,suggest);
  }else{
    getIndexNumJ(text,true,suggest);
  }*/
});



