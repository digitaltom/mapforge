namespace :seed do
  desc "Seed example map data from a .geojson file"
  task :from_file, %i[path] => :environment do |_, args|
    web_mercator_factory = RGeo::Cartesian.factory(srid: 3857)
    gps_factory = RGeo::Cartesian.factory(srid: 4326)

    file = File.read(args.fetch(:path))
    map_name = File.basename(args.fetch(:path)).tr(".", "_")
    map = Map.find_or_create_by(id: map_name)
    map.features.delete_all
    feature_collection = RGeo::GeoJSON.decode(file, geo_factory: gps_factory)

    feature_collection.each do |feature|
      next unless feature.geometry

      # transform coords from EPSG:4326 to EPSG:3857
      transformed_geometry = RGeo::Feature.cast(feature.geometry, factory: web_mercator_factory, project: true)
      transformed_feature = RGeo::GeoJSON::Feature.new(transformed_geometry, nil, feature.properties)
      map.features.create!(RGeo::GeoJSON.encode(transformed_feature))
    end
    puts "Created map '#{map.id}' with #{feature_collection.size} features from #{args.fetch :path}"
  end
end
