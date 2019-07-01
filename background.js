const rms= new RMS()

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

  chrome.debugger.onDetach.addListener(()=> rms.cleanUp())

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

function requestListener() {
  chrome.webRequest.onBeforeRequest.addListener((data)=> {
    if (data.url=== rms.url && data.method=='POST')
    rms.prepareRequest(data)
  },{'urls':['https://app2.rmscloud.com/*']},['requestBody'])
}

function currentTab(callback) {
  chrome.tabs.query(rms.activeWindow, (tabArray)=> {
    rms.currentTabId = tabArray[0].id
    callback(rms.currentTabId)
  })
}

 function attachDebugger() {
  return tabId => chrome.debugger.attach({tabId}, rms.version, onAttach.bind(null, tabId))
}

 function sendMessage () {
  return id => chrome.tabs.sendMessage(id, rms.response() , response => response.done ? rms.cleanUp(): null)
}

function onAttach(tabId) {
    chrome.debugger.sendCommand({tabId}, "Network.enable")
    chrome.debugger.onEvent.addListener(allEventHandler)
}

function allEventHandler(debuggeeId, message, params) {
  if (rms.currentTabId != debuggeeId.tabId) return
    if (message == "Network.responseReceived") {
      if(rms.isCheckIn())
        chrome.debugger.sendCommand(
        {tabId: debuggeeId.tabId}, 
          "Network.getResponseBody", 
          {"requestId": params.requestId}, 
          ({body})=> rms.mapData(body))
    }
}