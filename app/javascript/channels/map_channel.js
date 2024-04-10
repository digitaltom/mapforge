import consumer from 'channels/consumer'
import { flash } from 'map/map'
import { initializeMapProperties } from 'map/properties'
import { updateFeature, deleteFeature } from 'map/feature'

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
          updateFeature(data.feature)
          break
        case 'delete_feature':
          deleteFeature(data.feature.id)
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
