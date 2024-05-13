require 'rails_helper'

describe 'Map List' do
  let!(:maps) { create_list(:map, 3) }

  before do
    visit maps_path
  end

  it 'shows links to maps' do
    expect(page).to have_selector(:xpath, "//a[@href='/m/#{maps[0].public_id}']")
  end

  it 'shows link to create new map' do
    expect(page).to have_link('New map')
  end

  context 'when creating new map' do
    it 'user can create new map' do
      click_link('New map')
      click_button('Create Map')
      expect(page).to have_css('#map')
    end
  end
end
