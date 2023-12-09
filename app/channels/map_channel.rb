class MapChannel < ApplicationCable::Channel
  def subscribed
    stream_from "map_channel"
    Rails.logger.debug "MapChannel subscribed"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    Rails.logger.debug "MapChannel unsubscribed"
  end

  def update_feature(data)

    Rails.logger.debug "MapChannel update: #{data}"

    # ActionCable.server.broadcast "map_channel", message: "update"

  end
end
