class RMS{
    constructor() {
        this.data=[]
        this.request={}
    }

    get activeWindow() {
        return {
            currentWindow: true,
            active: true
          }
    }

    get version() {
        return '1.0'
    }

    get checkInId() {
        return 5
    }

    get url() {
        return 'https://app2.rmscloud.com/api/Reservation/InOutScreen/RetrieveScreenData'
    }

    cleanUp() {
        this.data=[]
        this.request={}
    }

    prepareRequest(data) {
        this.request= this.getDateAndHotel(data)
    }

    response() {
        return {
            data: this.data,
            request: this.request
        }
    }

    getDateAndHotel(data) {
        const buffer = data.requestBody.raw[0].bytes;
        const payloadString = decodeURIComponent(String.fromCharCode.apply(null,new Uint8Array(buffer)));
        const obj= JSON.parse(payloadString);
        return {
         start:obj.FromDate,
         end:obj.ToDate,
         hotel:this.getHotelName(obj.Properties),
         id:obj.ReportView
        }
      }

      isCheckIn() {
       return this.request.id === this.checkInId
      }

       getHotelName(idArray) {
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

      mapData(body) {
        const dataObj = this.tryJSON(body);
        if (dataObj) {
            this.data = dataObj.map(c=>({
              'Rs No':c.ResId,
              'Email':c.Email,
              'Mobile':c.Mobile,
              'Last Name':c.Surname,
              'First Name':c.Given,
              'Town':c.Town
            }));
        }
      }

      tryJSON(text){
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
}