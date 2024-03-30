class Feature
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :layer, optional: true, touch: true, counter_cache: true
  delegate :map, to: :layer

  field :type, type: String, default: "Feature"
  field :geometry, type: Hash, default: {}
  field :properties, type: Hash, default: {}

  scope :point, -> { where("geometry.type" => "Point") }
  scope :polygon, -> { where("geometry.type" => "Polygon") }
  scope :line_string, -> { where("geometry.type" => "LineString") }
  scope :latest, -> { order_by(created_at: :desc) }

  after_destroy :broadcast_destroy, if: -> { layer.present? && map.present? }
  after_save :broadcast_update, if: -> { layer.present? && map.present? }

  def geojson
    { id: _id.to_s,
      type:,
      geometry:,
      properties: }
  end

  # input file formats are typically gps format EPSG:4326 (4326) or
  # web_mercator format EPSG:3857 (3857)
  def self.from_collection(collection, collection_format: 4326, db_format: 4326)
    db_format = RGeo::Cartesian.factory(srid: db_format)
    collection_format = RGeo::Cartesian.factory(srid: collection_format)
    feature_collection = RGeo::GeoJSON.decode(collection, geo_factory: collection_format)
    feature_collection.map do |feature|
      next unless feature.geometry
      # transform coords from input to db format
      transformed_geometry = RGeo::Feature.cast(feature.geometry, factory: db_format, project: true)
      transformed_feature = RGeo::GeoJSON::Feature.new(transformed_geometry, feature.feature_id, feature.properties)
      create!(RGeo::GeoJSON.encode(transformed_feature))
    end
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
