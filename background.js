const activeWindow= {
  currentWindow: true,
  active: true
}
let data;
let request;
const version = "1.0";
let currentTabId;
const url="https://app2.rmscloud.com/api/Reservation/InOutScreen/RetrieveScreenData";

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'app2.rmscloud.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  chrome.runtime.onMessage.addListener((message)=> {
    if (message==='start') {
      chrome.webRequest.onBeforeRequest.addListener((data)=>{
          if (data.url===url && data.method=='POST')
          request= getDateAndHotel(data)
        },{'urls':['https://app2.rmscloud.com/*']},['requestBody']);
        
        chrome.tabs.query(activeWindow,(tabArray)=> {
          currentTabId = tabArray[0].id;
          chrome.debugger.attach({tabId:currentTabId}, version, onAttach.bind(null, currentTabId));
      })
  }
    else if (message==='download') {
      chrome.tabs.query(activeWindow, (tabArray)=> {
        currentTabId = tabArray[0].id;
        chrome.tabs.sendMessage(currentTabId, {data,request});
      });
    }
});
});

function getHotelName(idArray) {
  if (idArray.length!==1) return
  const id = idArray[0]
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
        console.log('something is wrong')
  }
}

function getDateAndHotel(data) {
  const buffer=data.requestBody.raw[0].bytes;
  const payloadString=  decodeURIComponent(String.fromCharCode.apply(null,new Uint8Array(buffer)));
  const obj= JSON.parse(payloadString);
  return{
   start:obj.FromDate,
   end:obj.ToDate,
   hotel:getHotelName(obj.Properties)
  }
}


function onAttach(tabId) {
    chrome.debugger.sendCommand({tabId}, "Network.enable");
    chrome.debugger.onEvent.addListener(allEventHandler);
}

function allEventHandler(debuggeeId, message, params) {
    if (currentTabId != debuggeeId.tabId) return
    if (message == "Network.responseReceived") {
        chrome
        .debugger
        .sendCommand(
          {tabId: debuggeeId.tabId}, 
          "Network.getResponseBody", 
          {"requestId": params.requestId}, 
          ({body})=> {
            if (typeof body === 'string') {
              console.log(body);
              const dataObj = JSON.parse(body)
              console.log(dataObj);
              const collection = dataObj.InOutData
              const views = dataObj.InOutViews
              const count = views.filter(v=>v.Id==5)[0].Total
              if (collection && collection.length==count) {
                data = collection.map(c=>({
                  'Rs No':c.ResId,
                  'Email':c.Email,
                  'Mobile':c.Mobile,
                  'Last Name':c.Surname,
                  'First Name':c.Given,
                  'Town':c.Town
                }));
              }
            }
        });
    }
}