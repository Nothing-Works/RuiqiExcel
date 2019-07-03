chrome.runtime.onMessage.addListener((response, sender, sendResponse) =>send(response,sendResponse))

function send(response,sendResponse) {
    const {data,request}= response
    if (data.length === 0 || typeof data === 'undefined') {
        alert('There is no data')
        sendResponse({done: false})
    }
    else{
        const filterData= new FilterData(data)
        const xls = new XlsExport(filterData.final())
        xls.exportToXLS(`${time()}+${request.hotel}+${request.start}+${request.end}.xls`)
        sendResponse({done: true})
    }
}

function time() {
    const date = new Date()
    return `${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}`
}