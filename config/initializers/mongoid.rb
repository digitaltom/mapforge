Mongoid.configure do
  target_version = "9.0"

  # Load Mongoid behavior defaults. This automatically sets
  # features flags (refer to documentation)
  config.load_defaults target_version

  # It is recommended to use config/mongoid.yml for most Mongoid-related
  # configuration, whenever possible, but if you prefer, you can set
  # configuration values here, instead:
  #
  #   config.log_level = :debug
  #
  # Note that the settings in config/mongoid.yml always take precedence,
  # whatever else is set here.
end

# Enable Mongo driver query cache for Rack
# Rails.application.config.middleware.use(Mongo::QueryCache::Middleware)

# Enable Mongo driver query cache for ActiveJob
# ActiveSupport.on_load(:active_job) do
#   include Mongo::QueryCache::Middleware::ActiveJob
# end

# Fail application boot if mongodb is not available
begin
  Mongoid.load!(File.join(Rails.root, "config", "mongoid.yml"))
  # skip test in asset precompilation
  return if ENV["SECRET_KEY_BASE_DUMMY"]
  Mongoid.client(:default).command({ isMaster: 1 })
rescue Mongo::Error::NoServerAvailable => e
  puts "Could not connect to MongoDB. #{e.message}"
  exit 1
end
