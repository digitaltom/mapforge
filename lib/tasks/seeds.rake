include Rails.application.routes.url_helpers

Rails.logger = ActiveSupport::TaggedLogging.new(Logger.new($stdout))

namespace :seed do
  desc "Seed example map data from a geojson file"
  task :geojson_file, %i[path] => :environment do |_, args|
    # the public id of the imported map will be the filename without extension
    path = args.fetch(:path)
    map_name = File.basename(path, File.extname(path)).tr(".", "_")
    collection_format = 4326 # geojson default format is epsg:4326 (WGS84)
    map = Map.find_or_create_by(public_id: map_name)

    file = File.read(path)
    geojson = JSON.parse(file)

    map.layer.features = Feature.from_collection(geojson, collection_format: collection_format)

    puts "Created map with #{map.features.size} features from #{path}"
    puts "Public id: #{map.public_id}, private id: #{map.id}"
  end

  desc "Import map from a mapforge export file"
  task :mapforge_file, %i[path] => :environment do |_, args|
    map = Map.create_from_file(args.fetch(:path), collection_format: 4326)
  end

  desc "Seed default frontpage"
  task :frontpage, %i[path] => :environment do |_, args|
    # The frontpage demo is defined in app/javascript/frontpage.js
    # It uses the map with public id 'frontpage' as background, and
    # iterates over some example layers
    Map.create_from_file("db/seeds/frontpage/frontpage.json")
    Map.create_from_file("db/seeds/frontpage/frontpage-category-friends.json")

    # import user icons (from https://unsplash.com/s/photos/person?license=free)
    Dir.foreach("db/seeds/frontpage/icons") do |filename|
     next if filename == "." or filename == ".."
     # Do work on the remaining files & directories
     puts "Processing: #{filename}"
     Image.create(img: File.new(Rails.root.join("db/seeds/frontpage/icons/" + filename)),
      public_id: filename)
    end

    Map.create_from_file("db/seeds/frontpage/frontpage-category-data.json")
    Map.create_from_file("db/seeds/frontpage/frontpage-category-office.json")
  end
end
