module Features
  module Helpers
    def take_a_screenshot
      filename = Rails.root.join("capybara-#{Time.zone.now.to_i}.png")
      puts "\033[36mINFO: Saving screenshot at: #{filename}\033[0m\n\n"
      page.save_screenshot(filename, full: true)
    end
  end
end
