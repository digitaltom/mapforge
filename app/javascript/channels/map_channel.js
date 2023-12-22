import consumer from "channels/consumer"
import { updateFeature, deleteFeature } from 'map/map'

let mapChannel;
export { mapChannel };

export function initializeSocket() {
  consumer.subscriptions.create({ channel: "MapChannel", map_id: gon.map_id }, {
    connected() {
      // Called when the subscription is ready for use on the server
      console.log('connected to map_channel ' + gon.map_id);
      mapChannel = this;
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
      console.log('disconnected from map_channel');
    },

    received(data) {
      console.log('received from map_channel: ' + JSON.stringify(data))
      switch (data.event) {
        case 'update_feature':
          updateFeature(data['feature'])
          break;
        case 'delete_feature':
          deleteFeature(data['feature'])
          break;
      }
    },

    send_message(action, data) {
      data['map_id'] = gon.map_id
      console.log('Sending: [' + action + '] ' + JSON.stringify(data))
      // Call the original perform method
      this.perform(action, data);
    }
  })
}
