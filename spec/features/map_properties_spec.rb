require 'rails_helper'

describe 'Map' do
  subject(:map) { create(:map) }

  before do
    visit map_path(map)
  end

  context 'with initial map rendering' do
    it 'shows map edit buttons' do
      expect(page).to have_css('#maplibre-map')
      expect(page).to have_css('.maplibregl-ctrl-map')
    end
  end

  context 'when changing map properties' do
    it 'basemap update gets saved' do
      find('.maplibregl-ctrl-map').click
      expect(page).to have_text('Configure Map')
      find_all('.layer-preview ')[2].click
      sleep(1) # make sure actioncable request is processed
      expect(map.reload.base_map).to eq 'stamenTonerTiles'
    end

    it 'terrain update gets saved' do
      find('.maplibregl-ctrl-map').click
      expect(page).to have_text('Configure Map')
      find('#map-terrain').click
      sleep(1) # make sure actioncable request is processed
      expect(map.reload.terrain).to eq true
    end
  end
end
