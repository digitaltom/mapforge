class MapChannel < ApplicationCable::Channel
  def subscribed
    # map = Map.find(params[:id])
    # stream_for map

    stream_from 'map_channel'
    Rails.logger.debug 'MapChannel subscribed'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    Rails.logger.debug 'MapChannel unsubscribed'
  end

  def update_feature(data)
    # TODO: validate map id
    Feature.find(feature_atts(data)['id']).update(feature_atts(data))

    # ActionCable.server.broadcast "map_channel", message: "update"
  end

  def new_feature(data)
    # TODO: validate map id
    Feature.create!(feature_atts(data))

    # ActionCable.server.broadcast "map_channel", message: "update"
  end

  private

  def feature_atts(data)
    # TODO: validate
    # ActionController::Parameters.new(data).permit(:type, :id, geometry: [:type, coordinates: []], properties: {})
    data.slice('type', 'id', 'geometry', 'properties')
  end
end
