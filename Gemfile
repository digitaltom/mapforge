source "https://rubygems.org"

ruby "3.3.0"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.1.2"

# The original asset pipeline for Rails [https://github.com/rails/sprockets-rails]
gem "sprockets-rails"

# Use sqlite3 as the database for Active Record
# gem "sqlite3", "~> 1.4"

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"

# Use JavaScript with ESM import maps [https://github.com/rails/importmap-rails]
gem "importmap-rails"

# Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
gem "turbo-rails"

# Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem "gon"
gem "stimulus-rails"

# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jbuilder"

# Use Redis adapter to run Action Cable in production
gem "redis", ">= 4.0.1"

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

gem "amazing_print"
gem "haml"
gem "mongoid"
gem "mongoid_rails_migrations"

# map + coordinates libraries
gem "rgeo"
gem "rgeo-geojson"
gem "rgeo-proj4"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "byebug"
  gem "debug", platforms: %i[mri windows]
  gem "dotenv-rails", require: "dotenv/rails-now"
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
  gem "brakeman"
  gem "bundler-audit"

  gem "web-console"
  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"
end

group :test do
  gem "factory_bot_rails"
  gem "capybara"
  gem "capybara-screenshot"
  gem "rspec"
  gem "rspec-rails"
  gem "selenium-webdriver"
  gem "simplecov"
  gem "database_cleaner-mongoid"
  gem "mongoid-rspec", github: "mongoid-rspec/mongoid-rspec"
end
