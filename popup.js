document.addEventListener('DOMContentLoaded', ()=> {
   const start= document.getElementById('start')
   const download= document.getElementById('download')

   start.addEventListener('click', ()=>chrome.runtime.sendMessage('start'))
   download.addEventListener('click', ()=>chrome.runtime.sendMessage('download'))
});