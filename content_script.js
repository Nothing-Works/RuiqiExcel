const date = new Date()

const time = () => `${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}`

chrome.runtime.onMessage.addListener((response, sender, sendResponse) =>send(response,sendResponse))

function send(response,sendResponse) {
    const {data,request}= response
    if (data.length === 0 || typeof data === 'undefined') {
        alert('There is no data')
        sendResponse({done: false})
    } 
    else{
        const xls = new XlsExport(data)
        xls.exportToXLS(`${time()}+${request.hotel}+${request.start}+${request.end}.xls`)
        sendResponse({done: true})
    }
}