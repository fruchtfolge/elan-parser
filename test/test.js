const parser = require('../index')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

function extension(element, extFilter) {
  var extName = path.extname(element)
  return extName === '.' + extFilter
}

// read all test xml / gml files and compare to expected results

fs.readdir('test/data', (err, files) => {
  if (err) throw new Error(err)
  const xmlFiles = files.filter((file) => {return extension(file,'xml')})
  xmlFiles.forEach(file => {
    try {
      const fileName = path.basename(file, '.xml')
      const xml = fs.readFileSync(`test/data/${file}`,'utf8')
      const gml = fs.readFileSync(`test/data/${fileName}.gml`,'utf8')
      const data = parser.join(parser.parseXML(xml), parser.parseGML(gml))

      // Uncomment in order to create results to compare to
      // fs.writeFileSync(`test/results/${fileName}.json`,JSON.stringify(data))

      const expected = JSON.parse(fs.readFileSync(`test/results/${fileName}.json`,'utf8'))
      assert.deepEqual(data,expected)
    } catch (e) {
      throw new Error(e)
    }
  })
})

/*
const elanGet = require('../../elan-api/index.js')

async function getLatestInvekosData(farmNo, pass) {
  const xml = await elanGet(farmNo, pass)
  const gml = await elanGet(farmNo, pass, {type: 'Geometrien'})

  return parser.join(parser.parseXML(xml), parser.parseGML(gml))
}

getLatestInvekosData('057540125701', '222222')
*/
