class FilterData{
    invalidEmailREX = new RegExp('^.*@guest.booking.com|feedback@booking.com.*$','igm')

    constructor(data){
        this.init(data)
    }

    meta= {
        total:'',
        unique:'',
        hasData:''
    }

    init(data) {
        this.data = data
        this.setMeta('total', this.data.length)
    }

    removeNoData() {
        this.data = this.data.filter(this.hasData)
        this.setMeta('hasData', this.data.length)
    }

    hasData() {
        return true;
    }

    removeDuplications() {
      this.data = this.data.filter(this.isUnique)
      this.setMeta('unique', this.data.length)
    }

    isUnique(c, i, self) {
        return self.findIndex(t =>
          t.Email === c.Email &&
          t.Mobile === c.Mobile &&
          t['Last Name'] === c['Last Name'] &&
          t['First Name'] === c['First Name']) === i
      }

    removeInvalidEmails() {
        this.data = this.data.map(c => (
            {
                ...c,
               Email: this.invalidEmailREX.test(c.Email) ? '' : c.Email
            }
        ))
    }

    setMeta(key, value) {
        this.meta[key]= `${key} is ${value}`
    }

    final() {
        this.removeDuplications()
        this.removeNoData()
        this.removeInvalidEmails()
        return this.combine()
    }

    combine() {
        return [...this.data, this.meta]
    }
}