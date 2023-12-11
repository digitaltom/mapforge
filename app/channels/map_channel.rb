class MapChannel < ApplicationCable::Channel
  def subscribed
    # TODO: validate client access to map id
    map = Map.find(params[:map_id])
    stream_from "map_channel_#{map.id}"
    Rails.logger.debug "MapChannel subscribed for '#{map.id}'"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    Rails.logger.debug 'MapChannel unsubscribed'
  end

  def update_feature(data)
    # TODO: validate client access to map id
    map = Map.find(data['map_id'])
    feature = map.features.find(feature_atts(data)['id'])
    feature.update!(feature_atts(data))

    # ActionCable.server.broadcast "map_channel", message: "update"
  end

  def new_feature(data)
    # TODO: validate client access to map id
    map = Map.find(data['map_id'])
    map.features.create!(feature_atts(data))
  end

  private

  def feature_atts(data)
    # TODO: validate
    # ActionController::Parameters.new(data).permit(:type, :id, geometry: [:type, coordinates: []], properties: {})
    data.slice('type', 'id', 'geometry', 'properties')
  end
end
