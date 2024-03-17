require 'rails_helper'

describe 'Frontpage' do
  before do
    map = Map.create_from_file('db/seeds/frontpage/frontpage.json', file_format: 3857)
    map.update!(base_map: 'osmDefaultTiles', center: [ 8.15537608256954, 49.88616136237681 ],
               zoom: 10)
    map = Map.create_from_file('db/seeds/frontpage/frontpage-category-friends.json', file_format: 3857)
    map.update!(base_map: 'osmDefaultTiles', center: [ 8.15537608256954, 49.88616136237681 ],
               zoom: 10)
    visit root_path
  end

  it 'shows frontpage map' do
    expect(page).to have_selector(:xpath, "//div[@id='frontpage-map']")
    expect(page).to have_text('mapforge.org')
  end
end
