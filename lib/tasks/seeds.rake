include Rails.application.routes.url_helpers

namespace :seed do
  desc "Seed example map data from a .geojson file"
  task :from_file, %i[path] => :environment do |_, args|
    Map.create_from_file(args.fetch(:path), file_format: 4326)
  end


  desc "Seed default frontpage"
  task :frontpage, %i[path] => :environment do |_, args|
    # The frontpage demo is defined in app/javascript/frontpage.js
    # It uses the map with public id 'frontpage' as background, and
    # iterates over some example layers
    Map.create(public_id: "frontpage") unless Map.find_by(public_id: "frontpage")

    unless Map.find_by(public_id: "frontpage-category-friends")
      Map.create_from_file("db/seeds/frontpage/frontpage-category-friends.json")
    end

    unless Map.find_by(public_id: "frontpage-category-data")
      Map.create_from_file("db/seeds/frontpage/frontpage-category-data.json")
    end
  end
end
