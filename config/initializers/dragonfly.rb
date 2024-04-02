require 'dragonfly'
require 'dragonfly/mongoid_data_store'

# Configure
Dragonfly.app.configure do
  plugin :imagemagick

  secret "de11cfe896ea9350ca27bc8603fb72438808a7ec214080d89bdfe1f82508c3c8"

  url_format "/media/:job/:name"
  datastore :mongoid

  # datastore :file,
  #   root_path: Rails.root.join('public/system/dragonfly', Rails.env),
  #   server_root: Rails.root.join('public')


  # custom processors: http://markevans.github.io/dragonfly/processors
  processor :rounded do |content|
    #byebug
    content.shell_update(ext: 'png') do |old_path, new_path|
      #{}"/usr/bin/convert #{old_path} -alpha set -background none -thumbnail #{size}^ -vignette 0x0 #{new_path}"
      "/usr/bin/convert #{old_path} -alpha set -background none -vignette 0x0 #{new_path}"
    end
  end

  processor :crop_quadrant do |content|
    height = content.analyse(:height)
    width = content.analyse(:width)
    # Calculate the center of the image
    center_x, center_y = width / 2, height / 2

    # Calculate the quadrant size
    quadrant_size = [width, height].min / 2

    # Calculate the crop area
    crop_x = center_x - quadrant_size
    crop_y = center_y - quadrant_size

    # Crop the image
    content.shell_update do |old_path, new_path|
      "/usr/bin/convert #{old_path} -crop #{quadrant_size}x#{quadrant_size}+#{crop_x}+#{crop_y} #{new_path}"
    end
  end
end

# Logger
Dragonfly.logger = Rails.logger

# Mount as middleware
Rails.application.middleware.use Dragonfly::Middleware

# Add model functionality
ActiveSupport.on_load(:active_record) do
  extend Dragonfly::Model
  extend Dragonfly::Model::Validations
end
