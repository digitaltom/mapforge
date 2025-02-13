import { map, geojsonData } from 'maplibre/map'
import * as f from 'helpers/functions'
import { showFeatureDetails } from 'maplibre/modals'

export let highlightedFeatureId
export let stickyFeatureHighlight = false

export function resetHighlightedFeature (source = 'geojson-source') {
  if (highlightedFeatureId) {
    map.setFeatureState({ source, id: highlightedFeatureId }, { active: false })
    highlightedFeatureId = null
    // drop feature param from url
    const url = new URL(window.location.href)
    url.searchParams.delete('f')
    window.history.replaceState({}, document.title, url.toString())
  }
  // reset active modals
  f.e('#feature-details-modal', e => { e.classList.remove('show') })
}

export function highlightFeature (feature, sticky = false, source = 'geojson-source') {
  if (highlightedFeatureId !== feature.id) { resetHighlightedFeature() }
  if (feature.id) {
    stickyFeatureHighlight = sticky
    highlightedFeatureId = feature.id
    // load feature from source, the style only returns the dimensions on screen
    const sourceFeature = geojsonData.features.find(f => f.id === feature.id)
    if (sourceFeature) {
      showFeatureDetails(sourceFeature)
      // A feature's state is not part of the GeoJSON or vector tile data but can get used in styles
      map.setFeatureState({ source, id: feature.id }, { active: true })
      // set url to feature
      if (sticky) {
        const newPath = `${window.location.pathname}?f=${feature.id}`
        window.history.pushState({}, '', newPath)
      }
    } else {
      console.error('Feature #' + feature.id + ' not found in geojson-source!')
    }
  }
}
