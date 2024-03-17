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

  def create_public_id
    self.public_id = SecureRandom.hex(4) unless public_id.present?
  end

  def create_layer
    self.layer = Layer.create!(map: self) unless layer.present?
  end

  def public_id_must_be_unique_or_nil
    if public_id.present? && Map.where(public_id: public_id).where.not(id: id).exists?
      errors.add(:public_id, "has already been taken")
    end
  end

  def self.frontpage
    find_by(public_id: "frontpage")
  end

  # the public id of the imported map will be the filename without extension
  # input file formats are typically gps format EPSG:4326 (4326)
  # db backend is in web_mercator format EPSG:3857 (3857)
  # TODO check how to embed map properties in geojson
  def self.create_from_file(path, overwrite: false, file_format: 4326, db_format: 3857)
    file = File.read(path)
    map_name = File.basename(path, File.extname(path)).tr(".", "_")

    map = Map.find_or_initialize_by(public_id: map_name)
    if !overwrite && map.persisted?
      raise "Error: Map with public id '#{map_name}' already exists, please delete it first."
    end
    map.save! unless map.persisted?

    map.features.delete_all
    db_format = RGeo::Cartesian.factory(srid: db_format)
    import_format = RGeo::Cartesian.factory(srid: file_format)
    feature_collection = RGeo::GeoJSON.decode(file, geo_factory: import_format)
    feature_collection.each do |feature|
      next unless feature.geometry
      # transform coords from input to db format
      transformed_geometry = RGeo::Feature.cast(feature.geometry, factory: db_format, project: true)
      transformed_feature = RGeo::GeoJSON::Feature.new(transformed_geometry, nil, feature.properties)
      map.features.create!(RGeo::GeoJSON.encode(transformed_feature))
    end

    Rails.logger.info "Created map with #{feature_collection.size} features from #{path}"
    Rails.logger.info "Public id: #{map.public_id}, private id: #{map.id}"
    map
  end

  private

  def broadcast_update
    ActionCable.server.broadcast("map_channel_#{id}",
                                 { event: "update_map", map: properties.as_json })
  end
end
