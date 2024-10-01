import consumer from 'channels/consumer'
import {
  upsert, destroy, setBackgroundMapLayer, mapProperties,
  initializeMaplibreProperties, geojsonData, map, resetGeojsonData
} from 'maplibre/map'
import { disableEditControls, enableEditControls } from 'maplibre/edit'
import { status } from 'helpers/status'

export let mapChannel
let reconnectTimer

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    unload()
  })
})

function unload () {
  if (mapChannel) { mapChannel.unsubscribe(); mapChannel = null }
}

export function initializeSocket () {
  unload()
  // console.log('Request socket for ' + window.gon.map_id)
  consumer.subscriptions.create({ channel: 'MapChannel', map_id: window.gon.map_id }, {
    connected () {
      // Called when the subscription is ready for use on the server
      clearInterval(reconnectTimer)
      console.log('Connected to map_channel ' + window.gon.map_id)
      map.fire('online', { detail: { message: 'Connected to map_channel' } })
      mapChannel = this
      enableEditControls()
      if (geojsonData) {
        status('Connection to server re-established')
        initializeMaplibreProperties()
        resetGeojsonData()
        setBackgroundMapLayer(mapProperties.base_map, true)
      } else {
        status('Connection to server established')
      }
    },

    disconnected () {
      // Called when the subscription has been terminated by the server
      console.log('Disconnected from map_channel ' + window.gon.map_id)
      map.fire('offline', { detail: { message: 'Disconnected from map_channel' } })
      disableEditControls()
      mapChannel = null
      // show error with delay to avoid showing it on unload/refresh
      setTimeout(function () { status('Connection to server lost', 'error', 60 * 60 * 1000) }, 1000)
      reconnectTimer = setInterval(() => { console.log('Trying to re-connect websocket..'); initializeSocket() }, 10000)
    },

    received (data) {
      console.log('received from map_channel: ' + JSON.stringify(data))
      switch (data.event) {
        case 'update_feature':
          upsert(data.feature)
          break
        case 'delete_feature':
          destroy(data.feature.id)
          break
        case 'update_map':
          window.gon.map_properties = data.map
          initializeMaplibreProperties()
          setBackgroundMapLayer()
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
