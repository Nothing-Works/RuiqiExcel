const activeWindow= {
  currentWindow: true,
  active: true
}
const version = "1.0";
const checkInId= 5;
const url="https://app2.rmscloud.com/api/Reservation/InOutScreen/RetrieveScreenData";
let data=[];
let request={};
let currentTabId;

chrome.runtime.onInstalled.addListener(()=> {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, ()=> {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'app2.rmscloud.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  chrome.debugger.onDetach.addListener(()=>cleanUp())

  chrome.runtime.onMessage.addListener((message)=> {
    if (message==='start') {
        requestListener()
        currentTab(attachDebugger())
  }
    else if (message==='download') {
        currentTab(sendMessage())        
    }
});
});

function cleanUp() {
  data= []
  request = {}
}

function requestListener() {
  chrome.webRequest.onBeforeRequest.addListener((data)=> {
    if (data.url===url && data.method=='POST')
    request= getDateAndHotel(data)
  },{'urls':['https://app2.rmscloud.com/*']},['requestBody'])
}

function currentTab(callback) {
  chrome.tabs.query(activeWindow, (tabArray)=> {
    currentTabId = tabArray[0].id
    callback(currentTabId)
  })
}

 function attachDebugger() {
  return tabId => chrome.debugger.attach({tabId}, version, onAttach.bind(null, tabId));
}

 function sendMessage () {
  return id => chrome.tabs.sendMessage(id, {data,request} , response => response.done ? cleanUp(): null)
}

function onAttach(tabId) {
    chrome.debugger.sendCommand({tabId}, "Network.enable")
    chrome.debugger.onEvent.addListener(allEventHandler)
}

function allEventHandler(debuggeeId, message, params) {
  if (currentTabId != debuggeeId.tabId) return
    if (message == "Network.responseReceived") {
      if (request.id===checkInId)
        chrome.debugger.sendCommand(
          {tabId: debuggeeId.tabId}, 
          "Network.getResponseBody", 
          {"requestId": params.requestId}, 
          ({body})=> mapData(body))
    }
}

function mapData(body) {
    const dataObj = tryJSON(body);
    if (dataObj) {
        data = dataObj.map(c=>({
          'Rs No':c.ResId,
          'Email':c.Email,
          'Mobile':c.Mobile,
          'Last Name':c.Surname,
          'First Name':c.Given,
          'Town':c.Town
        }));
    }
}

function tryJSON(text){
  if (typeof text!=='string'){
      return false;
  }
  try{
    const obj = JSON.parse(text)
    if (obj && obj.InOutData) {
      return obj.InOutData;
    }
    return false;
  }
  catch (error){
      return false;
  }
}

function getHotelName(idArray) {
  if (idArray.length!==1) return 'all'
  const id= idArray[0]
  switch (id) {
    case 1:
      return 'laneway backpackers'
    case 2:
        return 'liberty apartment hotel'
    case 4:
        return 'the setup on dixon'
    case 5:
        return 'the setup on dixon apartment'
    case 3:
        return 'the set up on manners'
    default:
      return 'all'
  }
}

function getDateAndHotel(data) {
  const buffer = data.requestBody.raw[0].bytes;
  const payloadString = decodeURIComponent(String.fromCharCode.apply(null,new Uint8Array(buffer)));
  const obj= JSON.parse(payloadString);
  return {
   start:obj.FromDate,
   end:obj.ToDate,
   hotel:getHotelName(obj.Properties),
   id:obj.ReportView
  }
}