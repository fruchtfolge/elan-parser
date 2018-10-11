const parser = require('fast-xml-parser')
const proj4 = require('proj4')
const {polygon} = require('@turf/helpers')
const utils = require('./src/utils.js')

// configure proj4 in order to convert GIS coordinates to web mercator
proj4.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
const fromETRS89 = new proj4.Proj('EPSG:25832');
const toWGS84 = new proj4.Proj('WGS84');

module.exports = {
  parseXML(xml) {
    return new Promise((resolve,reject) => {
      if (!parser.validate(xml)) return reject('Invalid XML structure.')
      const json = parser.parse(xml)
      
      const basis = {
        'applicationYear': utils.getSafe(() => json.nn.antragsjahr),
        'farmId': utils.getSafe(() => json.nn.bnrzd),
        'state': utils.getSafe(() => json.nn.land.bezeichnung),
        'fieldBlockConstant': utils.getSafe(() => json.nn.land.feldblockkonstante),
        'stateNo': utils.getSafe(() => json.nn.land.nummer)
      }
      
      if (utils.getSafe(() => json.nn.land.parzelle)) { 
        return resolve(json.nn.land.parzelle.map(field => {
          return Object.assign(basis,field)
        }))
      } else {
        reject('No fields found in XML.')
      }
    })
  },
  
  parseGML(gml) {
    return new Promise((resolve,reject) => {
      if (!parser.validate(gml)) return reject('Invalid GML structure.')
      
      const json = parser.parse(gml)
      
      if (utils.getSafe(() => json['wfs:FeatureCollection']['gml:featureMember'])) { 
        return resolve(json['wfs:FeatureCollection']['gml:featureMember'].map(field => {
          const id = utils.getSafe(() => field["elan:tschlag"]["elan:SCHLAGNR"])
          const year = utils.getSafe(() => field["elan:tschlag"]["elan:WIRTSCHAFTSJAHR"])
          let coordinates = utils.getSafe(() => field["elan:tschlag"]["elan:GEO_COORD_"]["gml:Polygon"]["gml:outerBoundaryIs"]["gml:LinearRing"]["gml:coordinates"])
          
          if (!coordinates) return
          
          // split coordinate string into array of strings, then into array of arrays and transform string values to numbers
          coordinates = coordinates.split(' ')
          coordinates = coordinates.map(pair => {return pair.split(',')})
          coordinates[0] = coordinates[0].map(coord => { console.log(coord);return Number(coord)})

          coordinates = coordinates.map(latlng => {
						return proj4(fromETRS89, toWGS84, latlng);
					})
          
          const feature = polygon([polygon], {number: id, year: year})
          
          return {
            schlag: {
              nummer: id
            },
            geometry: feature
          }
          
        }))
      } else {
        reject('No fields found in GML.')
      }
    })
  }
  
}
