class Map
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  # one default layer for now
  has_one :layer
  default_scope -> { order_by(created_at: :asc) }

  field :base_map, type: String
  field :center, type: Array
  field :zoom, type: String
  field :name, type: String
  field :description, type: String
  field :public_id, type: String

  delegate :features, to: :layer
  delegate :feature_collection, to: :layer
  delegate :features_count, to: :layer

  DEFAULT_MAP = :osmTiles
  DEFAULT_CENTER = [ 11.077, 49.447 ].freeze
  DEFAULT_ZOOM = 12

  after_save :broadcast_update
  before_create :create_public_id, :create_layer
  validate :public_id_must_be_unique_or_nil

  def properties
    { name: name,
      description: description,
      public_id: public_id,
      base_map: base_map || DEFAULT_MAP,
      center: center || DEFAULT_CENTER,
      zoom: zoom || DEFAULT_ZOOM
    }
  end

  def keys
    { mapbox: ENV["MAPBOX_KEY"],
      maptiler: ENV["MAPTILER_KEY"] }
  end

  def create_public_id
    self.public_id = SecureRandom.hex(4) unless public_id.present?
  end

  def create_layer
    self.layer = Layer.create!(map: self) unless layer.present?
  end

  def to_json
    { properties: properties, layers: [ feature_collection ] }.to_json
  end

  def public_id_must_be_unique_or_nil
    if public_id.present? && Map.where(public_id: public_id).where.not(id: id).exists?
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

  def broadcast_update
    ActionCable.server.broadcast("map_channel_#{id}",
                                 { event: "update_map", map: properties.as_json })
  end
end
