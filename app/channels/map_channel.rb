class MapChannel < ApplicationCable::Channel
  # Allow to subscribe to changes with public + private id,
  # Check auth on update methods by looking up map with private id
  def subscribed
    map = Map.find(params[:map_id]) || Map.find_by(public_id: params[:map_id])
    stream_from "map_channel_#{params[:map_id]}"
    Rails.logger.debug { "MapChannel subscribed for '#{params[:map_id]}'" }
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    # Rails.logger.debug "MapChannel unsubscribed"
  end

  def update_feature(data)
    map = Map.find(data["map_id"])
    feature = map.features.find(feature_atts(data)["id"])
    feature.update!(feature_atts(data))
  end

  def update_map(data)
    map = Map.find(data["map_id"])
    map.update!(map_atts(data))
  end

  def new_feature(data)
    map = Map.find(data["map_id"])
    map.layers.first.features.create!(feature_atts(data))
  end

  def delete_feature(data)
    map = Map.find(data["map_id"])
    feature = map.features.find(feature_atts(data)["id"])
    feature.destroy
  end

  private

  def feature_atts(data)
    # TODO: validate nested atts
    # ActionController::Parameters.new(data).permit(:type, :id, geometry: [:type, coordinates: []], properties: {})
    atts = data.slice("type", "id", "geometry", "properties")
    # drop the id in properties which is a workaround for https://github.com/mapbox/mapbox-gl-js/issues/2716
    atts["properties"]&.delete("id")
    atts
  end

  def map_atts(data)
    data.slice("name", "description", "base_map", "center", "zoom", "pitch", "bearing", "terrain")
  end
end
