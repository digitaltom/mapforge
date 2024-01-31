require 'rails_helper'

describe 'Map' do
  subject(:map) { Map.create! }

  before do
    visit map_path(map)
  end

  context 'with initial map rendering' do
    it 'shows map edit buttons' do
      expect(page).to have_css('#map')
      expect(page).to have_css('.button-map')
    end
  end

  context 'when changing map properties' do
    it 'update gets saved' do
      find('.button-map').click
      expect(page).to have_text('Configure Map')
      find_all('.layer-preview ')[2].click
      expect(map.reload.base_map).to eq 'satelliteStreetTiles'
    end
  end
end
