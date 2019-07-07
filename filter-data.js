class FilterData{
    constructor(data) {
        this.init(data)
    }

    meta= {
        total:'',
        unique:'',
        hasData:''
    }

    init(data) {
        this.data = data
        this.trimAllData()
        this.setMeta('total', this.data.length)
    }

    trimAllData() {
        this.data.forEach(c=> (
            Object.keys(c).forEach(key=> (
                c[key] = typeof c[key] === 'string' ? c[key].trim() : c[key]
                ))
            ))
    }

    removeNoData() {
        this.data = this.data.filter(this.hasData())
        this.setMeta('hasData', this.data.length)
    }

    removeDuplications() {
      this.data = this.data.filter(this.isUnique())
      this.setMeta('unique', this.data.length)
    }

    isUnique() {
        return (c, i, self)=> self.findIndex(t =>
          t.Email === c.Email &&
          t.Mobile === c.Mobile &&
          t['Last Name'] === c['Last Name'] &&
          t['First Name'] === c['First Name']) === i
    }

    hasData() {
        return c=> !(this.invalidValue(c.Email) && this.invalidValue(c.Mobile) && this.invalidValue(c.Town))
    }

    invalidValue(value) {
       return value == '.' || value == '' || value == null || typeof value == 'undefined' || value == '/'
    }

    invalidEmails(email) {
        return email.includes('@guest.booking.com') || email.includes('feedback@booking.com') || email == '.'
    }

    removeInvalidValues() {
        this.data = this.data.map(c=> (
            {
                ...c,
                Email: this.invalidEmails(c.Email) ? '' : c.Email,
                Mobile: this.invalidValue(c.Mobile) ? '' : c.Mobile,
                Town: this.invalidValue(c.Town) ? '' : c.Town
            }))
    }

    setMeta(key, value) {
        this.meta[key]= `${key} is ${value}`
    }

    final() {
        this.removeDuplications()
        this.removeNoData()
        this.removeInvalidValues()
        return this.combine()
    }

    combine() {
        return [...this.data, this.meta]
    }
}