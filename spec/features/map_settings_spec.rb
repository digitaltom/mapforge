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
      find(".layer-preview[data-base-map='osmRasterTiles']").click
      expect(page).to have_text('Map style loaded')
      expect(map.reload.base_map).to eq 'osmRasterTiles'
    end

    it 'terrain update gets saved' do
      find('.maplibregl-ctrl-map').click
      expect(page).to have_text('Configure Map')
      find('#map-terrain').click
      # Terrain feature is only used with maptiler key
      # expect(page).to have_text('Terrain added to map')
      expect(map.reload.terrain).to eq true
    end
  end

  context 'when map settings change server side' do
    it 'name update' do
      find('.maplibregl-ctrl-map').click
      map.update(name: 'New World')
      expect(page).to have_text('New World')
    end

    it 'basemap update' do
      find('.maplibregl-ctrl-map').click
      map.update(base_map: 'osmRasterTiles')
      expect(page).to have_text('Map style loaded')
      expect(page).to have_css('.layer-preview[data-base-map="osmRasterTiles"].active')
    end

    it 'terrain update' do
      find('.maplibregl-ctrl-map').click
      map.update(terrain: true)
      expect(page).to have_text('Map style loaded')
      expect(find('#map-terrain')).to be_checked
    end

    it 'map center update' do
      find('.maplibregl-ctrl-map').click
      map.update(center: [ 11, 49.5 ])
      expect(page).to have_text('Map view updated')
      expect(page).to have_text('Center: 11,49.5')
      expect(page.evaluate_script("[map.getCenter().lng, map.getCenter().lat].toString()")).to eq('11,49.5')
    end

    it 'client follows default center update if map did not move' do
      find('.maplibregl-ctrl-map').click
      feature = create(:feature, :point, layer: map.layer, coordinates: [ 11.543, 49.123 ])
      expect(page).to have_text('Map view updated')
      # new default center are the feature coordinates
      expect(page.evaluate_script("[map.getCenter().lng.toFixed(3), map.getCenter().lat.toFixed(3)].toString()"))
        .to eq(feature.coordinates.join(','))
      expect(page).to have_text("Center: #{feature.coordinates.join(',')} (auto)")
    end

    it 'map zoom update' do
      find('.maplibregl-ctrl-map').click
      map.update(zoom: 16)
      expect(page).to have_text('Map view updated')
      expect(page.evaluate_script("map.getZoom()")).to eq(16)
      expect(page).to have_text('Zoom: 16')
    end

    it 'map pitch update' do
      find('.maplibregl-ctrl-map').click
      map.update(pitch: 33)
      expect(page).to have_text('Map view updated')
      expect(page.evaluate_script("map.getPitch()")).to eq(33)
      expect(page).to have_text('Pitch: 33')
    end

    it 'map orientation update' do
      find('.maplibregl-ctrl-map').click
      map.update(bearing: 33)
      expect(page).to have_text('Map view updated')
      expect(page.evaluate_script("map.getBearing()")).to eq(33)
      expect(page).to have_text('Bearing: 33')
    end
  end
end
