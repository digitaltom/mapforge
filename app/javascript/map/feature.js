import { vectorSource, changedFeatureQueue } from 'map/map'
import * as functions from 'helpers/functions'
import { vectorStyle } from 'map/styles'
import { animateMarker } from 'map/animations'
import { hideFeatureDetails } from 'map/interactions/readonly'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol
const turf = window.turf

export const geoJsonFormat = new ol.format.GeoJSON({
  dataProjection: 'EPSG:4326', // server stores [11.077, 49.447]
  featureProjection: 'EPSG:3857' // map uses [1232651.8535, 6353568.4466]
})

export function featureAsGeoJSON (feature) {
  const geoJSON = geoJsonFormat.writeFeatureObject(feature)
  return geoJSON
}

// This method gets called from local updates + the hotwire channel
// The method does not store the changes to the feature
export function updateFeature (data, source = vectorSource) {
  // TODO: only create/update if visible in bbox
  const newFeature = geoJsonFormat.readFeature(data)
  const feature = source.getFeatureById(data.id)
  if (!feature) {
    // addFeature will not add if id already exists
    source.addFeature(newFeature)
  } else {
    if (changedCoords(feature, newFeature)) {
      console.log("updating changed coords for feature '" + data.id + "'")
      if (data.geometry.type === 'Point') {
        animateMarker(newFeature, feature.getGeometry().getCoordinates(),
          newFeature.getGeometry().getCoordinates())
      }
      feature.setGeometry(newFeature.getGeometry())
    }
    if (changedProps(feature, newFeature)) {
      updateProps(feature, newFeature.getProperties())
    }
    feature.changed()
  }
  vectorSource.changed()
  // drop from changedFeatureQueue, it's coming from server
  functions.arrayRemove(changedFeatureQueue, newFeature)
}

export function deleteFeature (id) {
  const feature = vectorSource.getFeatureById(id)
  if (feature) {
    console.log('deleting feature ' + id)
    vectorSource.removeFeature(feature)
    hideFeatureDetails()
  }
}

// https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html
// needed because setProperties() only updates, and does not drop...
// properties also include the geometry of the feature
export function updateProps (feature, newProps) {
  const oldProps = featureAsGeoJSON(feature).properties
  for (const key in oldProps) {
    // drop existing key if not included in newProps
    if (!newProps[key]) { feature.unset(key) }
  }
  feature.setProperties(newProps)
  feature.setStyle(vectorStyle(feature))
}

// function changed (feature, newFeature) {
//   return (changedCoords(feature, newFeature) || changedProps(feature, newFeature))
// }

function changedCoords (feature, newFeature) {
  // compare coords with limited precision, because of formt conversion errors
  const oldCoords = JSON.stringify(formatCoords(feature.getGeometry().getCoordinates()))
  const newCoords = JSON.stringify(formatCoords(newFeature.getGeometry().getCoordinates()))
  const changed = (oldCoords !== newCoords)
  if (changed) { console.log('changed coords: ' + oldCoords + ' -> ' + newCoords) }
  return changed
}

function changedProps (feature, newFeature) {
  const oldProps = JSON.stringify(featureAsGeoJSON(feature).properties)
  const newProps = JSON.stringify(featureAsGeoJSON(newFeature).properties)
  const changed = (oldProps !== newProps)
  if (changed) { console.log('changed props: ' + oldProps + ' -> ' + newProps) }
  return changed
}

function formatCoords (coords, precision = 7) {
  // coords are not an array of coordinates for points
  if (coords.length === 2 && !Array.isArray(coords[0])) {
    return [coords[0].toFixed(precision), coords[1].toFixed(precision)]
  }
  return coords.map(function (coordinate) {
    return [coordinate[0].toFixed(precision), coordinate[1].toFixed(precision)]
  })
}

// simplify drawn strings with https://turfjs.org/docs/#simplify
export function simplifyGeometry (feature, tolerance = 0.01) {
  const options = { tolerance: 0.1, highQuality: false, mutate: true }
  const coordsCount = feature.getGeometry().getCoordinates().length
  const geojsonFeature = new ol.format.GeoJSON().writeFeatureObject(feature)
  const coords = turf.simplify(geojsonFeature, options).geometry.coordinates
  feature.getGeometry().setCoordinates(coords)
  const newCoordsCount = feature.getGeometry().getCoordinates().length
  console.log('Simplified coords from #' + coordsCount + ' to #' + newCoordsCount)
}
