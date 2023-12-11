class Feature
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :map, optional: true

  field :type, type: String, default: 'Feature'
  field :geometry, type: Hash, default: {}
  field :properties, type: Hash, default: {}

  after_save :broadcast_update

  def geojson
    { id: id.to_s,
      type:,
      geometry:,
      properties: }
  end

  private

  def broadcast_update
    ActionCable.server.broadcast("map_channel_#{map.id}", geojson.as_json)
  end
end
