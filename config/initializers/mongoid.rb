require "mongo"

begin
  # skip test in asset precompilation
  return if ENV["SECRET_KEY_BASE_DUMMY"]

  Mongoid.client(:default).command({ isMaster: 1 })

  # mongoid config
  Mongoid.raise_not_found_error = false
rescue Mongo::Error::NoServerAvailable => e
  puts "Could not connect to MongoDB. #{e.message}"
  exit 1
end
