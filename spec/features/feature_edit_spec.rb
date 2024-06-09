require 'rails_helper'

describe 'Map' do
  let(:map) { create(:map) }

  context 'with empty map' do
    before do
      visit map_path(map)
      expect(page).to have_css('.maplibregl-canvas')
    end

    it 'shows feature edit buttons' do
      expect(page).to have_css('.mapbox-gl-draw_line')
      expect(page).to have_css('.mapbox-gl-draw_polygon')
      expect(page).to have_css('.mapbox-gl-draw_point')
    end

    context 'when adding features' do
      it 'adding a marker to the map' do
        find('.mapbox-gl-draw_point').click
        expect { click_coord('#maplibre-map', 50, 50) }.to change { Feature.point.count }.by(1)
      end

      it 'adding a polygon to the map' do
        find('.mapbox-gl-draw_polygon').click
        click_coord('#maplibre-map', 50, 50)
        click_coord('#maplibre-map', 50, 150)
        click_coord('#maplibre-map', 150, 150)
        click_coord('#maplibre-map', 150, 50)
        click_coord('#maplibre-map', 50, 50)

        sleep(0.5) # wait for websocket msg
        expect(Feature.polygon.count).to eq(1)
      end
    end
  end

  context 'with polygon on map' do
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layer, title: 'Poly Title') }

    before do
      visit map_path(map)
      expect(page).to have_css('.maplibregl-canvas')
    end

    context 'with selected feature' do
      before do
        expect(page).to have_css("#maplibre-map[data-loaded='true']")
        click_coord('#maplibre-map', 50, 50)
        expect(page).to have_css('#edit-button-edit')
      end

      it 'shows feature title + details' do
        expect(page).to have_text('Poly Title')
      end

      it 'can update feature' do
        find('#edit-button-edit').click
        fill_in 'properties', with: '{"title": "TEST"}'
        find('.feature-update').click
        expect(polygon.reload.properties).to eq({ "title" => "TEST" })
      end

      it 'can delete feature' do
        find('#edit-button-trash').click
        sleep(0.5) # wait for websocket msg
        expect(Feature.count).to eq(0)
      end
    end
  end
end
