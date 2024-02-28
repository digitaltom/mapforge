class Feature
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :map, optional: true, touch: true, counter_cache: true

  field :type, type: String, default: "Feature"
  field :geometry, type: Hash, default: {}
  field :properties, type: Hash, default: {}

  scope :point, -> { where("geometry.type" => "Point") }
  scope :polygon, -> { where("geometry.type" => "Polygon") }
  scope :line_string, -> { where("geometry.type" => "LineString") }
  scope :latest, -> { order_by(created_at: :desc) }

  after_destroy :broadcast_destroy, if: -> { map.present? }
  after_save :broadcast_update, if: -> { map.present? }

  def geojson
    { id: id.to_s,
      type:,
      geometry:,
      properties: }
  end

  private

  def broadcast_update
    ActionCable.server.broadcast("map_channel_#{map.id}",
                                 { event: "update_feature", feature: geojson.as_json })
  end

  def broadcast_destroy
    ActionCable.server.broadcast("map_channel_#{map.id}",
                                 { event: "delete_feature", feature: geojson.as_json })
  end
end
