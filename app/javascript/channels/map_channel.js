import consumer from "channels/consumer"
import {addFeature} from 'map/map'
import ol from 'openlayers'

let mapChannel;
export { mapChannel };

consumer.subscriptions.create({ channel: "MapChannel", id: 1 }, {
  connected() {
    // Called when the subscription is ready for use on the server
    console.log('connected to map_channel');
    mapChannel = this;
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
    console.log('disconnected from map_channel');
  },

  received(data) {
   console.log('received from map_channel: ' + JSON.stringify(data));

   // TODO: assuming new feature
   addFeature(data)
  }
});
