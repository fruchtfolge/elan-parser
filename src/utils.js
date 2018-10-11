
module.exports = {
  
  getSafe(func, defVal) {
    try {
      return func()
    } catch (e) {
      if (!defVal) return ''
      return defVal
    }
  }
  
}
