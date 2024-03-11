class Layer
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :map, optional: true, touch: true
  has_many :features, dependent: :destroy

  field :features_count, type: Integer, default: 0

  def feature_collection
    { type: "FeatureCollection",
      features: features.map(&:geojson) }
  end
end
