require 'rails_helper'

describe 'Frontpage' do
  before do
    Map.create_from_file("db/seeds/frontpage/frontpage.json")
    Map.create_from_file("db/seeds/frontpage/frontpage-category-friends.json")
    Map.create_from_file("db/seeds/frontpage/frontpage-category-data.json")
    Map.create_from_file("db/seeds/frontpage/frontpage-category-office.json")
    visit root_path
  end

  it 'shows frontpage map' do
    expect(page).to have_selector(:xpath, "//div[@id='frontpage-map']")
    expect(page).to have_text('mapforge')
  end

  it 'shows tour' do
    expect(page).to have_text('map your friends')
  end
end
