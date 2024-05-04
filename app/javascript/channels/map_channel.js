import consumer from 'channels/consumer'
import { flash } from 'ol/map'
import { initializeMapProperties } from 'ol/properties'
import { updateFeature, deleteFeature } from 'ol/feature'
import { update, destroy } from 'maplibre/map'

export let mapChannel

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    unload()
  })
})

function unload () {
  if (mapChannel) { mapChannel.unsubscribe() }
}

export function initializeSocket () {
  unload()
  // console.log('Request socket for ' + window.gon.map_id)
  consumer.subscriptions.create({ channel: 'MapChannel', map_id: window.gon.map_id }, {
    connected () {
      // Called when the subscription is ready for use on the server
      console.log('Connected to map_channel ' + window.gon.map_id)
      mapChannel = this
      // flash('Connection to server established', 'success')
    },

    disconnected () {
      // Called when the subscription has been terminated by the server
      console.log('Disconnected from map_channel ' + window.gon.map_id)
      mapChannel = null
      // show error with delay to avoid showing it on unload/refresh
      setTimeout(function () { flash('Connection to server lost', 'error') }, 500)
    },

    received (data) {
      console.log('received from map_channel: ' + JSON.stringify(data))
      switch (data.event) {
        case 'update_feature':
          // ol feature update
          if (document.getElementById('map')) { updateFeature(data.feature) }
          // maplibre feature update
          if (document.getElementById('maplibre-map')) { update(data.feature) }
          break
        case 'delete_feature':
          // ol feature delete
          if (document.getElementById('map')) { deleteFeature(data.feature.id) }
          // maplibre feature delete
          if (document.getElementById('maplibre-map')) { destroy(data.feature.id) }
          break
        case 'update_map':
          window.gon.map_properties = data.map
          initializeMapProperties()
          break
      }
    },

    send_message (action, data) {
      data.map_id = window.gon.map_id
      console.log('Sending: [' + action + '] ' + JSON.stringify(data))
      // Call the original perform method
      this.perform(action, data)
    }
  })
}
