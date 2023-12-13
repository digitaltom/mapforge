class Map
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  has_many :features, dependent: :destroy

  def feature_collection
    { type: 'FeatureCollection',
      features: features.map(&:geojson) }
  end
end
