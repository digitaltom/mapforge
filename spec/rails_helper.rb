# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'simplecov'
SimpleCov.minimum_coverage 100
SimpleCov.start 'rails' do
  add_filter 'app/jobs/application_job.rb'
  add_filter 'lib/tasks'
end

require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'

require_relative '../config/environment'
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!

require 'database_cleaner/mongoid'
require 'capybara-screenshot/rspec'
require 'mongoid-rspec'

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Rails.root.glob('spec/support/**/*.rb').sort.each { |f| require f }

RSpec.configure do |config|
  # Remove this line to enable support for ActiveRecord
  config.use_active_record = false

  config.include Mongoid::Matchers, type: :model
  config.include Features::Helpers, type: :feature
  config.include FactoryBot::Syntax::Methods

  config.around do |spec|
    DatabaseCleaner.cleaning do
      spec.run
    end
  end

  # raise on js console errors
  class JavaScriptError< StandardError; end
  RSpec.configure do |config|
    config.after(:each, type: :feature) do |spec|
      unless spec.metadata[:skip_console_errors]
        levels = [ "SEVERE" ]
        # "maplibre-gl.js TypeError: Failed to fetch" seems to be caused by
        # the js file being cached already
        exclude = [ /TypeError: Failed to fetch/,
                    /The user aborted a request/ ]
        errors = page.driver.browser.logs.get(:browser)
                   .select { |e| levels.include?(e.level) && e.message.present? }
                   .reject { |e| exclude.any? { |ex| e.message =~ ex } }
                   .map(&:message)
        if errors.present?
          raise JavaScriptError, errors.join("\n\n")
        end
      end
    end
  end

  # If you enable ActiveRecord support you should uncomment these lines,
  # note if you'd prefer not to run each example within a transaction, you
  # should set use_transactional_fixtures to false.
  #
  # config.fixture_path = Rails.root.join('spec/fixtures')
  # config.use_transactional_fixtures = true

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, type: :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://rspec.info/features/6-0/rspec-rails
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
  # arbitrary gems may also be filtered via:
  # config.filter_gems_from_backtrace("gem name")
end
