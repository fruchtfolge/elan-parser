const parser = require('fast-xml-parser')
const _ = require('lodash')
const proj4 = require('proj4')
const {polygon} = require('@turf/helpers')
const utils = require('./src/utils.js')

// configure proj4 in order to convert GIS coordinates to web mercator
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs')
const fromETRS89 = new proj4.Proj('EPSG:25832')
const toWGS84 = new proj4.Proj('WGS84')

module.exports = {
  parseXML(xml) {
    if (!parser.validate(xml)) throw new Error('Invalid XML structure.')
    const json = parser.parse(xml)
    
    const basis = {
      'applicationYear': utils.getSafe(() => json.nn.antragsjahr),
      'farmId': utils.getSafe(() => json.nn.bnrzd),
      'state': utils.getSafe(() => json.nn.land.bezeichnung),
      'fieldBlockConstant': utils.getSafe(() => json.nn.land.feldblockkonstante),
      'stateNo': utils.getSafe(() => json.nn.land.nummer)
    }
    
    if (utils.getSafe(() => json.nn.land.parzelle)) { 
      return json.nn.land.parzelle.map(field => {
        return Object.assign(JSON.parse(JSON.stringify(basis)),field)
      })
    } else {
      throw new Error('No fields found in XML.')
    }
  },
  
  parseGML(gml) {
    if (!parser.validate(gml)) throw new Error ('Invalid GML structure.')
    
    const json = parser.parse(gml)
    
    if (utils.getSafe(() => json['wfs:FeatureCollection']['gml:featureMember'])) { 
      let results = []
      
      json['wfs:FeatureCollection']['gml:featureMember'].forEach(field => {
        const id = utils.getSafe(() => field['elan:tschlag']['elan:SCHLAGNR'])
        const year = utils.getSafe(() => field['elan:tschlag']['elan:WIRTSCHAFTSJAHR'])
        let coordinates = utils.getSafe(() => field['elan:tschlag']['elan:GEO_COORD_']['gml:Polygon']['gml:outerBoundaryIs']['gml:LinearRing']['gml:coordinates'])
        
        if (!coordinates) return

        // split coordinate string into array of strings
        coordinates = coordinates.split(' ')
        // then into array of arrays and transform string values to numbers
        coordinates = coordinates.map(pair => {return pair.split(',').map(coord => { return Number(coord)})})
        
        coordinates = coordinates.map(latlng => {
          return proj4(fromETRS89, toWGS84, latlng)
        })
        const feature = polygon([coordinates], {number: id, year: year})
        
        return results.push({
          schlag: {
            nummer: id
          },
          geometry: feature
        })
        
      })
      
      return results
    } else {
      throw new Error('No fields found in GML.')
    }
  },
  
  join(xml, gml) {    
    return xml.map(field => {
      const geometry = _.find(gml, utils.getSafe(() => { field.schlag.nummer }))
      if (!geometry) return field
      return Object.assign(field,geometry.geometry)
    })
  }
  
}
