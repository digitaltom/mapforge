require "capybara"
require "capybara/rails"
require "selenium-webdriver"
require_relative "../../spec/support/capybara.rb"

namespace :maps do
  desc "Take screenshot of all maps"
  task screenshots: :environment do
    base_url = ENV.fetch("MAPFORGE_HOST", "http://localhost:3000") + "/maps/"
    session = Capybara::Session.new(:headless_chrome)
    Map.pluck(:_id).map(&:to_s).each do |map_id|
      Puppeteer.launch(headless: true, ignore_https_errors: true) do |browser|
        context = browser.create_incognito_browser_context
        page = browser.new_page
        page.goto(base_url + map_id)
        page.screenshot(path: Rails.root.join("public/maps/#{map_id}.png").to_s)
        puts "Stored public/maps/#{map_id}.png"
      end
    end
  end
end
