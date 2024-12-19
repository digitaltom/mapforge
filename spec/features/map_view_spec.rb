require 'rails_helper'

describe 'Map public view' do
  let(:map) { create(:map) }
  let(:path) { map_path(map.public_id) }

  before do
    visit path
    expect(page).to have_css('#maplibre-map[data-loaded="true"]')
  end

  context 'with initial map rendering' do
    it 'shows map view buttons' do
      expect(page).to have_css('.maplibregl-ctrl-zoom-in')
      expect(page).to have_css('.maplibregl-ctrl-zoom-out')
      expect(page).to have_css('.maplibregl-ctrl-compass')
      expect(page).to have_css('.maplibregl-ctrl-geolocate')
    end
  end

  # features are created before loading the map, to make sure they're loaded via /features
  context 'with existing features' do
    # this polygon is in the middle of nbg (default view)
    let(:polygon) { create(:feature, :polygon_middle, title: 'Poly Title', desc: 'Poly Desc') }
    let(:map) { create(:map, features: [ polygon ]) }

    it 'shows feature details on hover' do
      # coordinates are calculated from the center middle
      hover_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('27.70 km²')
    end

    it 'feature details are not sticky on hover' do
      hover_coord('.map', 50, 50)
      expect(page).to have_text('Poly Title')
      hover_coord('.map', 400, 0)
      expect(page).to_not have_text('Poly Desc')
    end

    it 'shows feature details on click' do
      click_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('27.70 km²')
    end

    it 'updates url on feature select' do
      click_coord('.map', 50, 50)
      expect(page).to have_current_path("/m/#{map.public_id}?f=#{polygon.id}")
    end

    it 'feature details are sticky on click' do
      click_coord('.map', 50, 50)
      expect(page).to have_text('Poly Desc')
      hover_coord('.map', 400, 0)
      expect(page).to have_text('Poly Desc')
      click_coord('.map', 400, 0)
      expect(page).to_not have_text('Poly Desc')
    end
  end

  context 'with feature id in url' do
    # this polygon is in the middle of nbg (default view)
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layers.first,
      properties: { title: 'F title' })}
    let(:path) { map_path(map, f: polygon.id) }

    it 'shows feature' do
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('F title')
    end
  end

  context 'with features that don\'t have properties' do
    # this polygon is in the middle of nbg (default view)
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layers.first, properties: nil) }

    it 'shows feature details on hover' do
      hover_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('No title')
    end
  end

  context 'with features added server side' do
    # feature is created after loading the map, to make sure it's loaded via websocket
    it 'receives new features via websocket channel' do
      create(:feature, :polygon_middle, layer: map.layers.first, title: 'New Title')
      click_coord('.map', 50, 50)
      expect(page).to have_css('#feature-details-modal')
      expect(page).to have_text('New Title')
    end
  end

  context 'with lost websocket' do
    it 'shows warning' do
      ActionCable.server.connections.each(&:close)
      expect(page).to have_text('Connection to server lost')
    end
  end

  context 'with other engines' do
    it 'deck.gl' do
      visit deck_path(map.public_id)
    end
  end
end
