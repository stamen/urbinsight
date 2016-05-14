import _ from 'lodash'
const cityObject = {
  cusco: [-71.9675, -13.5320],
  medellin: [-75.5812, 6.2442],
  abudhabi: [54.36745, 24.47608],
  lima: [-77.0428, -12.0464],
  budapest: [19.0402, 47.4979]
}

const cityList = ['cusco', 'medellin', 'abudhabi', 'lima', 'budapest']

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
export function cityObjectFunc (city) {
  if (Object.keys(cityObject).indexOf(city) !== -1) {
    return cityObject[city]
  } else {
    return cityObject[cityList[getRandomInt(0, 5)]]
  }
}

export function surveyGeoJSONCompiler (resource, map) {
  let geojson = {
    'type': 'FeatureCollection',
    'features': []
  }
  if (resource) {
    resource.surveys.forEach(function (survey) {
      let obj = {'type': 'Feature',
                 'geometry': {
                   'type': 'Point',
                   'coordinates': survey.geoCoordinates
                 },
                 'properties': {}
               }

      _.forEach(survey, function (value, key) {
        if (key !== 'geoCoordinates') {
          obj.properties[key] = value
        }
      })
      geojson.features.push(obj)
    })
    // console.log(map)
    map.getSource('surveys').setData(geojson)
  }
}
// Create a point and polygon based geojson
// Iterate through the features returned.
// separate them out and then add them to the respective source
// Need to flatten the values into strings before passing them to the source
// So that they could be queried and rendered on click

export function auditGeoJSONCompiler (resource, map) {
  if (resource) {
    let pointGeojson = {
      'type': 'FeatureCollection',
      'features': []
    }
    let polygonGeojson = {
      'type': 'FeatureCollection',
      'features': []
    }
    // Make this functional by using map
    resource.audits.forEach(function (audit) {
      audit.properties.id = audit._id
      if (audit.geometry.type === 'Point') {
        pointGeojson.features.push(audit)
      } else if (audit.geometry.type === 'Polygon') {
        polygonGeojson.features.push(audit)
      }
    })
    map.getSource('auditPolygons').setData(polygonGeojson)
    map.getSource('auditPoints').setData(pointGeojson)
  }
}
export function boundsArrayGenerator (bounds) {
  return [[bounds.getSouthWest().lng, bounds.getSouthWest().lat],
          [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
          [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
          [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
          [bounds.getSouthWest().lng, bounds.getSouthWest().lat]]
}
