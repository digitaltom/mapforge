class Map
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  has_many :features, dependent: :destroy

  field :base_map, type: String
  field :center, type: Array
  field :zoom, type: String
  field :name, type: String
  field :description, type: String
  field :public_id, type: String

  # [satellite, satelliteStreets, osm]
  DEFAULT_MAP = :osmTiles
  DEFAULT_CENTER = [ 11.077, 49.447 ].freeze
  DEFAULT_ZOOM = 12

  after_save :broadcast_update

  validates :public_id, uniqueness: true, presence: false

  def properties
    { name: name,
      descripion: description,
      base_map: base_map || DEFAULT_MAP,
      center: center || DEFAULT_CENTER,
      zoom: zoom || DEFAULT_ZOOM
    }
  end

  def keys
    { mapbox: ENV["MAPBOX_KEY"],
      maptiler: ENV["MAPTILER_KEY"] }
  end

  def feature_collection
    { type: "FeatureCollection",
      features: features.map(&:geojson) }
  end

  def self.frontpage
    find_by(public_id: ENV["FRONTPAGE_MAP"] || "frontpage")
  end

  private

  def broadcast_update
    ActionCable.server.broadcast("map_channel_#{id}",
                                 { event: "update_map", map: properties.as_json })
  end
end
