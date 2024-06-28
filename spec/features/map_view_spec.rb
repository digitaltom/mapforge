require 'rails_helper'

describe 'Map public view' do
  let(:map) { create(:map) }

  context 'with initial map rendering' do
    before do
      visit map_path(map.public_id)
      expect(page).to have_css('.maplibregl-canvas')
    end

    it 'shows map view buttons' do
      expect(page).to have_css('.maplibregl-ctrl-zoom-in')
      expect(page).to have_css('.maplibregl-ctrl-zoom-out')
      expect(page).to have_css('.maplibregl-ctrl-compass')
      expect(page).to have_css('.maplibregl-ctrl-geolocate')
    end
  end

  # features are created before loading the map, to make sure they're loaded via /features
  context 'with existing features' do
    let!(:point) { create(:feature, :point, layer: map.layer) }
    # this polygon is in the middle of nbg (default view)
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layer,
      title: 'Poly Title', desc: 'Poly Desc') }
    let!(:line) { create(:feature, :line_string, layer: map.layer) }

    before do
      visit map_path(map.public_id)
      # make sure features are loaded
      expect(page).to have_css('.map[data-loaded="true"]')
    end

    it 'shows feature details on hover' do
      hover_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('24.09 km²')
    end

    it 'shows feature details on click' do
      click_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('24.09 km²')
    end
  end

  context 'with features added server side' do
    before do
      visit map_path(map.public_id)
      expect(page).to have_css('.map[data-loaded="true"]')
    end

    # feature is created after loading the map, to make sure it's loaded via websocket
    it 'receives new features via websocket channel' do
      create(:feature, :polygon_middle, layer: map.layer, title: 'New Title')
      click_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('New Title')
    end
  end

  context 'with other engines' do
    it 'deck.gl' do
      visit deck_path(map.public_id)
    end
  end
end
