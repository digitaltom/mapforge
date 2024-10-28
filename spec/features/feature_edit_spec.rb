require 'rails_helper'

describe 'Feature edit' do
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
      it 'adding a point to the map' do
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
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layers.first, title: 'Poly Title') }

    context 'with selected feature' do
      before do
        click_coord('#maplibre-map', 50, 50)
        expect(page).to have_css('#edit-button-edit')
      end

      it 'shows feature title + details' do
        expect(page).to have_text('Poly Title')
      end

      it 'adds feature id to url' do
        expect(page).to have_current_path("/m/#{map.id}?f=#{polygon.id}")
      end

      it 'can raw update feature' do
        find('#edit-button-edit').click
        find('#edit-button-raw').click
        fill_in 'properties', with: '{"title": "TEST"}'
        find('.feature-update').click
        # the actioncable events of map + feature update are not always received in the same order:
        expect(page).to have_text('Updated feature').or have_text('Map properties updated')
        expect(polygon.reload.properties).to eq({ "title" => "TEST" })
      end

      it 'can delete feature' do
        accept_alert do
          find('#edit-button-trash').click
        end
        # the actioncable events of map + feature update are not always received in the same order:
        expect(page).to have_text("Deleting feature #{polygon.id}")
          .or have_text('Map properties updated')
          .or have_text('Map view updated')
        expect(Feature.count).to eq(0)
      end
    end
  end

  context 'with point on map' do
    let!(:point) { create(:feature, :point_middle, layer: map.layers.first, title: 'Point Title') }

    context 'with selected feature' do
      before do
        click_coord('#maplibre-map', 50, 50)
        find('#edit-button-edit').click
      end

      it 'can update point size' do
        find('#point-size').set(15)
        expect(page).to have_selector('#point-size-val', text: '15')
        expect(point.reload.properties['marker-size']).to eq('15')
      end

      it 'can update title' do
        fill_in 'feature-title', with: "New Title"
        wait_for { point.reload.properties['title'] }.to eq('New Title')
      end

      it 'can update label' do
        expect(page).to_not have_selector('#feature-label')
        click_button 'Add label'
        fill_in 'feature-label', with: "New Label"
        wait_for { point.reload.properties['label'] }.to eq('New Label')
      end

      # it 'can update desc' do
      #   expect(page).to_not have_selector('#feature-desc-input')
      #   click_button 'Add description'
      #   expect(page).to have_text('Add a description')
      #   within("#feature-desc") do
      #    fill_in '.CodeMirror textarea', with: "New Desc"
      #   end
      #   wait_for { point.reload.properties['desc'] }.to eq('New Desc')
      # end
    end
  end

  context 'with lost websocket' do
    it 'disables edit buttons' do
      ActionCable.server.connections.each(&:close)
      expect(page).to have_css('.mapbox-gl-draw_ctrl-draw-btn[disabled]')
    end
  end
end
