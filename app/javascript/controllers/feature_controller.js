import { Controller } from '@hotwired/stimulus'
import { flash, vectorSource } from 'ol/map'
import { mapChannel } from 'channels/map_channel'
import { hoverStyle } from 'ol/styles'
import { selectEditInteraction, undoInteraction, hideFeatureEdit, reloadFeatureEdit } from 'ol/interactions/edit'
import { featureAsGeoJSON, updateProps, deleteFeature } from 'ol/feature'

export default class extends Controller {
  static targets = ['properties']

  update () {
    const detailsContainer = document.querySelector('.feature-details-edit')
    const feature = vectorSource.getFeatureById(detailsContainer.dataset.featureId)
    const oldProps = featureAsGeoJSON(feature).properties
    const newProps = JSON.parse(this.propertiesTarget.value)
    updateProps(feature, newProps)
    feature.setStyle(hoverStyle(feature))
    reloadFeatureEdit(feature)
    // console.log('push undo: ' + JSON.stringify(oldProps) + '->' + JSON.stringify(newProps))
    undoInteraction.push('changeproperties', {
      feature,
      oldProps,
      newProps
    }, 'Change feature properties')
    mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
    flash('Feature updated', 'success')
  }

  delete () {
    const detailsContainer = document.querySelector('.feature-details-edit')
    const feature = vectorSource.getFeatureById(detailsContainer.dataset.featureId)
    selectEditInteraction.getFeatures().remove(feature)
    deleteFeature(feature)
    hideFeatureEdit()
    mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
    flash('Feature deleted', 'success')
  }
}
