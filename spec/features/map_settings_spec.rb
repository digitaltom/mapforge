require 'rails_helper'

describe 'Map' do
  subject(:map) { create(:map, center: nil, zoom: nil) }

  before do
    visit map_path(map)
    expect(page).to have_css("#maplibre-map[data-loaded='true']")
  end

  context 'with initial map rendering' do
    it 'shows map settings button' do
      expect(page).to have_css('#maplibre-map')
      expect(page).to have_css('.maplibregl-ctrl-map')
    end
  end

  context 'when using map settings modal' do
    it 'basemap update gets saved' do
      find('.maplibregl-ctrl-map').click
      expect(page).to have_text('Configure Map')
      find(".layer-preview[data-base-map='stamenTonerTiles']").click
      expect(page).to have_text('Map style loaded')
      expect(map.reload.base_map).to eq 'stamenTonerTiles'
    end

    it 'terrain update gets saved' do
      find('.maplibregl-ctrl-map').click
      expect(page).to have_text('Configure Map')
      find('#map-terrain').click
      expect(page).to have_text('Map style loaded')
      expect(map.reload.terrain).to eq true
    end
  end

  context 'when map settings change server side' do
    it 'basemap update' do
      map.update(base_map: 'stamenTonerTiles')
      expect(page).to have_text('Map style loaded')
      find('.maplibregl-ctrl-map').click
      expect(page).to have_css('.layer-preview[data-base-map="stamenTonerTiles"].active')
    end

    it 'terrain update' do
      map.update(terrain: true)
      expect(page).to have_text('Map style loaded')
      find('.maplibregl-ctrl-map').click
      expect(find('#map-terrain')).to be_checked
    end

    it 'map center update' do
      map.update(center: [ 11, 49.5 ])
      expect(page).to have_text('Map view updated')
      expect(page.evaluate_script("[map.getCenter().lng, map.getCenter().lat].toString()")).to eq('11,49.5')
    end

    it 'client follows default center update if map did not move' do
      feature = create(:feature, :point, layer: map.layer, coordinates: [ 11, 49.5 ])
      expect(page).to have_text('Map view updated')
      # new default center are the feature coordinates
      expect(page.evaluate_script("[map.getCenter().lng, map.getCenter().lat].toString()"))
        .to eq(feature.coordinates.join(','))
    end

    it 'map zoom update' do
      map.update(zoom: 16)
      expect(page).to have_text('Map view updated')
      expect(page.evaluate_script("map.getZoom()")).to eq(16)
    end

    it 'map pitch update' do
      map.update(pitch: 33)
      expect(page).to have_text('Map view updated')
      expect(page.evaluate_script("map.getPitch()")).to eq(33)
    end

    it 'map orientation update' do
    map.update(bearing: 33)
    expect(page).to have_text('Map view updated')
    expect(page.evaluate_script("map.getBearing()")).to eq(33)
    end
  end
end
