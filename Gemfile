source "https://rubygems.org"
ruby "3.3.3"

gem "rails"

gem "sprockets-rails"
gem "puma"
gem "thruster" # https://github.com/basecamp/thruster

# Rails
gem "importmap-rails"
gem "turbo-rails"
gem "jbuilder"
gem "bootsnap", require: false
gem "rack-cache", require: "rack/cache"

# Javascript
gem "gon"
gem "stimulus-rails"

# Databases
gem "redis", ">= 4.0.1"
gem "mongoid"
gem "mongoid_rails_migrations"

# image uploads
# https://github.com/markevans/dragonfly (rdoc: https://rubydoc.info/github/markevans/dragonfly/)
# https://github.com/demersus/dragonfly-mongoid_data_store
gem "dragonfly-mongoid_data_store"

gem "amazing_print"
gem "haml"

# taking screenshots with "rake maps:screenshots"
gem "capybara"
gem "capybara-screenshot"
gem "puppeteer-ruby"

# map + coordinates libraries
gem "rgeo"
gem "rgeo-geojson"
gem "rgeo-proj4"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "byebug"
  gem "debug", platforms: %i[mri windows]
  gem "dotenv-rails", require: "dotenv/load"
  gem "listen"
  gem "mongo_logs_on_roids"
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "rubocop"
  gem "rubocop-capybara"
  gem "rubocop-performance"
  gem "rubocop-rails"
  gem "rubocop-rspec"
  gem "rubocop-thread_safety"
  gem "rubocop-rails-omakase", require: false
  gem "rubocop-rubycw"
  gem "rubycritic", require: false
  gem "brakeman"
  gem "bundler-audit"

  gem "web-console"
  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"
end

group :test do
  gem "factory_bot_rails"
  gem "rspec"
  gem "rspec-rails"
  gem "selenium-webdriver"
  gem "simplecov"
  gem "database_cleaner-mongoid"
  gem "mongoid-rspec", github: "mongoid-rspec/mongoid-rspec"
end
