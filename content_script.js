const date = new Date()

const time = () => `${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}`

chrome.runtime.onMessage.addListener(response =>send(response))

function send({data,request}) {
    if (data.length === 0 || typeof data === 'undefined') alert('There is no data') 
        
    else{
        const xls = new XlsExport(data)
        xls.exportToXLS(`${time()}+${request.hotel}+${request.start}+${request.end}.xls`)    
    }
}