class Map
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  # one default layer for now
  has_one :layer

  field :base_map, type: String, default: -> { default_base_map }
  field :center, type: Array
  field :zoom, type: String
  field :terrain, type: Boolean
  field :pitch, type: String
  field :name, type: String
  field :description, type: String
  field :public_id, type: String
  field :private, type: Boolean

  delegate :features, to: :layer
  delegate :feature_collection, to: :layer
  delegate :features_count, to: :layer

  BASE_MAPS = [ "osmRasterTiles", "satelliteTiles",
                "stamenTonerTiles", "openTopoTiles" ]
  MAPTILER_MAPS = [ "maptilerBuildings", "maptilerHybrid", "maptilerDataviz",
                    "maptilerStreets", "maptilerNoStreets", "maptilerWinter",
                    "maptilerBike", "maptilerBasic" ]

  DEFAULT_CENTER = [ 11.077, 49.447 ].freeze
  DEFAULT_ZOOM = 12
  DEFAULT_PITCH = 30
  DEFAULT_TERRAIN = false

  after_save :broadcast_update
  before_create :create_public_id, :create_layer
  validate :public_id_must_be_unique

  def properties
    { name: name,
      description: description,
      public_id: public_id,
      base_map: get_base_map,
      center: center,
      default_center: default_center,
      zoom: zoom,
      default_zoom: default_zoom,
      pitch: pitch || DEFAULT_PITCH,
      terrain: terrain || DEFAULT_TERRAIN
    }
  end

  def self.provider_keys
    { mapbox: ENV["MAPBOX_KEY"],
      maptiler: ENV["MAPTILER_KEY"] }
  end

  def create_public_id
    self.public_id = SecureRandom.hex(4).tap { |i| i[0..1] = "11" } unless public_id.present?
  end

  def create_layer
    self.layer = Layer.create!(map: self) unless layer.present?
  end

  def to_json
    { properties: properties, layers: [ feature_collection ] }.to_json
  end

  def public_id_must_be_unique
    if Map.where(public_id: public_id).where.not(id: id).exists?
      errors.add(:public_id, "has already been taken")
    end
  end

  def self.frontpage
    find_by(public_id: "frontpage")
  end

  def self.create_from_file(path, collection_format: 4326)
    file = File.read(path)
    map_hash = JSON.parse(file)

    map = Map.find_or_create_by(public_id: map_hash["properties"]["public_id"])
    map.update(map_hash["properties"])
    map.features.delete_all
    map.layer.update!(features: Feature.from_collection(map_hash["layers"][0], collection_format: collection_format))

    Rails.logger.info "Created map with #{map.features.size} features from #{path}"
    Rails.logger.info "Public id: #{map.public_id}, private id: #{map.id}"
    map
  end

  private

  def default_center
    if features.present?
      # setting center to average of all coordinates
      coordinates = features.map { |feature| feature.coordinates(include_height: false) }
      coordinates = coordinates.flatten.each_slice(2).to_a
      average_latitude = coordinates.map(&:first).reduce(:+) / coordinates.size.to_f
      average_longitude = coordinates.map(&:last).reduce(:+) / coordinates.size.to_f
      [ average_latitude, average_longitude ]
    else
     DEFAULT_CENTER
    end
  end

  def default_zoom
    if features.present?
      DEFAULT_ZOOM
    else
     DEFAULT_ZOOM
    end
  end

  def get_base_map
    if MAPTILER_MAPS.include?(base_map)
      return base_map if ENV["MAPTILER_KEY"].present?
      logger.warn("Cannot use maptiler map #{base_map} without MAPTILER_KEY")
      return default_base_map
    elsif BASE_MAPS.include?(base_map)
      return base_map
    end
    logger.warn("Map '#{base_map}' not found, falling back to #{default_base_map}")
    default_base_map
  end

  def default_base_map
    ENV["DEFAULT_MAP"] || "osmRasterTiles"
  end

  def broadcast_update
    # broadcast to private + public channel
    [ id, public_id ].each do |id|
      ActionCable.server.broadcast("map_channel_#{id}",
                                   { event: "update_map", map: properties.as_json })
    end
  end
end
