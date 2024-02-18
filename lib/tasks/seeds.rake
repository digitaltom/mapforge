include Rails.application.routes.url_helpers

namespace :seed do
  desc "Seed example map data from a .geojson file"
  task :from_file, %i[path] => :environment do |_, args|
    db_format = RGeo::Cartesian.factory(srid: 3857) # web_mercator format
    import_format = RGeo::Cartesian.factory(srid: 4326) # gps format

    file = File.read(args.fetch(:path))
    map_name = File.basename(args.fetch(:path), File.extname(args.fetch(:path))).tr(".", "_")
    map = Map.find_or_create_by(public_id: map_name)

    raise "Error: Map with public id '#{map_name}' already exists, please delete it first." if map.persisted?

    map.features.delete_all
    feature_collection = RGeo::GeoJSON.decode(file, geo_factory: import_format)

    feature_collection.each do |feature|
      next unless feature.geometry

      # transform coords from EPSG:4326 to EPSG:3857
      transformed_geometry = RGeo::Feature.cast(feature.geometry, factory: db_format, project: true)
      transformed_feature = RGeo::GeoJSON::Feature.new(transformed_geometry, nil, feature.properties)
      map.features.create!(RGeo::GeoJSON.encode(transformed_feature))
    end
    puts "Created map with #{feature_collection.size} features from #{args.fetch :path}"
    puts "Public id: #{map_path(map.public_id)}, private id: #{map_path(map)}"
  end
end
