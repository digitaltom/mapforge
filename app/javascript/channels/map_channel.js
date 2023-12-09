import consumer from "channels/consumer"

let mapChannel;
export { mapChannel };

consumer.subscriptions.create("MapChannel", {
  connected() {
    // Called when the subscription is ready for use on the server
    mapChannel = this;
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
   console.log('received from map_channel: ' + data);
  }
});
