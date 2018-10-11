const elan = require('../index')
const fs = require('fs')

const xml = fs.readFileSync('test/2016.xml', 'utf8')
const gml = fs.readFileSync('test/2016.gml', 'utf8')

/*
elan.parseXML(xml)
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.log(err)
  })
  */
  
elan.parseGML(gml)
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.log(err)
  })
