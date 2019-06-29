document.addEventListener('DOMContentLoaded', function() {
   const start= document.getElementById('start');
   const download= document.getElementById('download');
   
   start.addEventListener('click',function () {
    chrome.runtime.sendMessage('start');
   })

   download.addEventListener('click',function () {
      chrome.runtime.sendMessage('download');
     })
});