class Layer
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :map, optional: true, touch: true
  has_many :features, dependent: :destroy

  field :features_count, type: Integer, default: 0

  def to_geojson
    { type: "FeatureCollection",
      features: features.map(&:geojson) }
  end

  def to_gpx
    # https://github.com/hiroaki/ruby-gpx?tab=readme-ov-file#examples
    GPX::GeoJSON.convert_to_gpx(geojson_data: to_geojson.to_json)
  end
end
