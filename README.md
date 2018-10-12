# ELAN Parser
A simple parsing library for the ELAN NRW XML files.
Consumed by the Fruchtfolge model.

## Usage
Standalone usage
```js
const parser = require('elan-parser')
const { readFileSync } = require('fs')

try {
  const xml = readFileSync('path/to/xml')
  const gml = readFileSync('path/to/gml')
  const data = elan.join(elan.parseXML(xml), elan.parseGML(gml))
  
  // do something with the data (e.g. store in Database)
} catch (e) {
  throw new Error(e)
} 
```

In combination with the [ELAN-API](https://github.com/fruchtfolge/elan-api)
```js
const elanGet = require('elan-api');
const parser = require('elan-parser')

async function getLatestInvekosData(farmNo, pass) {
  const xml = await elanGet(farmNo, pass)
  const gml = await elanGet(farmNo, pass, {type: 'Geometrien'})
  
    return parser.join(parser.parseXML(xml), parser.parseGML(gml))
}
```

## Testing
Place your testing XML files in the `test/data` directory. 
Upon first run, uncomment the following line in `test/test.js`
```js
fs.writeFileSync(`test/results/${fileName}.json`,JSON.stringify(data))
```
and comment out the following lines. Inspect the resulting `.json` files for correctness, then revert `test/test.js` to its original state. 
Once the setup has been completed, you can `npm test` as always.

## Contribution
Contribution is highly appreciated! When submitting a PR, make sure to `npm test`.

## License
MIT
