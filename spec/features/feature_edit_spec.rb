require 'rails_helper'

describe 'Map' do
  let(:map) { create(:map) }

  before do
    visit map_path(map)
    expect(page).to have_css("#maplibre-map[data-loaded='true']")
  end

  context 'with empty map' do
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
        click_coord('#maplibre-map', 10, 10)
        click_coord('#maplibre-map', 10, 50)
        click_coord('#maplibre-map', 50, 50)
        click_coord('#maplibre-map', 50, 10)
        click_coord('#maplibre-map', 10, 10)

        expect(page).to have_text('Map view updated')
        expect(Feature.polygon.count).to eq(1)
      end
    end
  end

  context 'with polygon on map' do
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layer, title: 'Poly Title') }

    context 'with selected feature' do
      before do
        click_coord('#maplibre-map', 50, 50)
        expect(page).to have_css('#edit-button-edit')
      end

      it 'shows feature title + details' do
        expect(page).to have_text('Poly Title')
      end

      it 'can update feature' do
        find('#edit-button-raw').click
        fill_in 'properties', with: '{"title": "TEST"}'
        find('.feature-update').click
        expect(page).to have_text('Updated feature')
        expect(polygon.reload.properties).to eq({ "title" => "TEST" })
      end

      it 'can delete feature' do
        accept_alert do
          find('#edit-button-trash').click
        end
        expect(page).to have_text('Deleting feature')
        expect(Feature.count).to eq(0)
      end
    end
  end

  context 'with lost websocket' do
    it 'disables edit buttons' do
      ActionCable.server.connections.each(&:close)
      expect(page).to have_css('.mapbox-gl-draw_ctrl-draw-btn[disabled]')
    end
  end
end
