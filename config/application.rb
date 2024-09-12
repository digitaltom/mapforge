require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
# require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Load available engines
Dir.glob("#{__dir__}/../engines/*").select { |i| File.directory?(i) }.each do |dir|
  engine_name = File.basename(dir)
  filename = File.expand_path(File.join(dir, "lib", "#{engine_name}.rb"))
  require_relative(filename) if File.exist?(filename)
end

module Mapforge
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.generators.system_tests = nil

    # https://snippets.aktagon.com/snippets/302-how-to-setup-and-use-rack-cache-with-rails
    # rails sets "cache-control", "private" by default
    config.action_dispatch.rack_cache = {
       verbose: true,
       etag: true,
       max_age: 60.minutes.to_i,
       metastore:   "file:tmp/cache/rack/meta",
       entitystore: "file:tmp/cache/rack/body"
    }
  end
end
