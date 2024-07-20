
require "selenium-webdriver"
require_relative "../../spec/support/capybara.rb"

namespace :maps do
  desc "Take preview screenshots of maps (changed last 24h by default)"
  task :screenshots, %i[hours] => :environment do |_, args|
    base_url = ENV.fetch("MAPFORGE_HOST", "http://localhost:3000") + "/m/"
    timeframe = args.hours ? args.hours.to_i.hours.ago : 5.years.ago
    Map.where(:updated_at.gte => timeframe).each do |map|
      begin
        # https://github.com/YusukeIwaki/puppeteer-ruby
        Puppeteer.launch(headless: true, ignore_https_errors: true) do |browser|
          context = browser.create_incognito_browser_context
          page = browser.new_page
          page.default_timeout = 60000
          map_url = base_url + map.public_id + "?static=true"
          failure = false

          page.on("response") do |response|
            status_code = response.status
            url = response.url
            unless status_code >= 200 && status_code < 400
              if url == map_url
                puts "Failed to capture: #{url}, Status Code: #{status_code}"
                failure = true
              end
            end
          end

          # page.on("console") { |response| puts "C: #{response.text}" }
          page.on("error") { |response| puts "E: #{response.text}" }

          page.viewport = Puppeteer::Viewport.new(width: 800, height: 600)
          puts "Loading #{map_url}"
          page.goto(map_url, wait_until: "networkidle0")
          page.wait_for_selector("#maplibre-map[data-loaded='true']", timeout: 30000)

          unless failure
            path = "public/previews/#{map.public_id}.png"
            page.screenshot(path: Rails.root.join(path).to_s)
            puts "Stored #{path}"
          end
         browser.close
        end
      rescue => e
        puts "Error creating map screenshot: #{e}, #{e.message}"
      end
    end
  end
end
