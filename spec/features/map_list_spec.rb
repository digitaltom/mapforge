require 'rails_helper'

describe 'Map List' do
  let!(:maps) { create_list(:map, 3) }

  before do
    visit maps_path
  end

  it 'shows links to maps' do
    expect(page).to have_link(maps[0].id.to_s)
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
