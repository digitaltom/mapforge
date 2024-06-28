module Ulogger
  class Engine < ::Rails::Engine
    isolate_namespace Ulogger
    config.generators.api_only = true

    config.generators do |g|
      g.test_framework :rspec
    end
  end
end
