include Rails.application.routes.url_helpers

namespace :seed do
  desc "Seed example map data from a geojson file"
  task :geojson_file, %i[path] => :environment do |_, args|
    # the public id of the imported map will be the filename without extension
    path = args.fetch(:path)
    map_name = File.basename(path, File.extname(path)).tr(".", "_")
    collection_format = 4326
    map = Map.find_or_create_by(public_id: map_name)

    file = File.read(path)
    map_hash = JSON.parse(file)

    map.features.delete_all
    map.layer.update!(features: Feature.from_collection(map_hash, collection_format: collection_format))

    puts "Created map with #{map.features.size} features from #{path}"
    puts "Public id: #{map.public_id}, private id: #{map.id}"
  end

  task :mapforge_file, %i[path] => :environment do |_, args|
    Map.create_from_file(args.fetch(:path), collection_format: 3857)
  end

  desc "Seed default frontpage"
  task :frontpage, %i[path] => :environment do |_, args|
    # The frontpage demo is defined in app/javascript/frontpage.js
    # It uses the map with public id 'frontpage' as background, and
    # iterates over some example layers
    Map.create_from_file("db/seeds/frontpage/frontpage.json", collection_format: 3857)
    Map.create_from_file("db/seeds/frontpage/frontpage-category-friends.json", collection_format: 3857)
    Map.create_from_file("db/seeds/frontpage/frontpage-category-data.json", collection_format: 3857)
  end
end
