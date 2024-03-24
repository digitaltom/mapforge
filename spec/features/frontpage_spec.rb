require 'rails_helper'

describe 'Frontpage' do
  before do
    Map.create_from_file('db/seeds/frontpage/frontpage.json', collection_format: 3857)
    Map.create_from_file('db/seeds/frontpage/frontpage-category-friends.json', collection_format: 3857)
    visit root_path
  end

  it 'shows frontpage map' do
    expect(page).to have_selector(:xpath, "//div[@id='frontpage-map']")
    expect(page).to have_text('mapforge')
  end
end
