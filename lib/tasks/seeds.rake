include Rails.application.routes.url_helpers

namespace :seed do
  desc "Seed example map data from a .geojson file"
  task :from_file, %i[path] => :environment do |_, args|
    Map.create_from_file(args.fetch(:path), file_format: 4326)
  end
end
