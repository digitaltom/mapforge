require 'rails_helper'

describe 'Map' do
  let(:map) { create(:map) }

  before do
    visit map_path(map)
    expect(page).to have_text('Connection to server established')
  end

  context 'with initial map rendering' do
    it 'shows feature edit buttons' do
      expect(page).to have_css('.button-map')
      expect(page).to have_css('.button-edit')
    end
  end

  context 'with selected edit mode' do
    let!(:polygon) { create(:feature, :polygon_middle, map:, title: 'Poly Title') }

    before do
      find('.button-edit').click
    end

    it 'shows flash hint' do
      expect(page).to have_text('Click on a map element to modify it')
    end

    context 'with selected feature' do
      before do
        click_coord('#map', 50, 50)
      end

      it 'shows feature details' do
        expect(page).to have_css('.feature-details-edit')
        expect(page).to have_text('Poly Title')
        textarea = find('textarea')
        expect(textarea.value).to eq(polygon.properties.to_json)
      end

      it 'can update feature' do
        fill_in 'properties', with: '{"title": "TEST"}'
        find('.feature-update').click
        expect(page).to have_text('Feature updated')
        expect(polygon.reload.properties).to eq({ "title" => "TEST" })
      end

      it 'can delete feature' do
        find('.feature-delete').click
        expect(page).to have_text('Feature deleted')
        expect(Feature.count).to eq(0)
      end
    end

    context 'when undo-ing / redo-ing' do
      before do
        click_coord('#map', 50, 50)
      end

      it 'can undo property changes' do
        fill_in 'properties', with: '{"title":"change1"}'
        find('.feature-update').click
        expect(page).to have_text('Feature updated')
        expect(polygon.reload.properties).to eq({ "title" => "change1" })
        fill_in 'properties', with: '{"title": "change2"}'
        find('.feature-update').click
        expect(page).to have_text('Feature updated')
        expect(polygon.reload.properties).to eq({ "title" => "change2" })
        find('.button-undo').click
        expect(page).to have_text('Feature updated')
        expect(page).to have_field('properties', with: '{"title":"change1"}')
      end

      it 'can redo property changes' do
        fill_in 'properties', with: '{"title":"change1"}'
        find('.feature-update').click
        expect(page).to have_text('Feature updated')
        expect(polygon.reload.properties).to eq({ "title" => "change1" })
        fill_in 'properties', with: '{"title": "change2"}'
        find('.feature-update').click
        expect(page).to have_text('Feature updated')
        expect(polygon.reload.properties).to eq({ "title" => "change2" })
        find('.button-undo').click
        expect(page).to have_text('Feature updated')
        expect(page).to have_field('properties', with: '{"title":"change1"}')
        find('.button-redo').click
        expect(page).to have_text('Feature updated')
        expect(page).to have_field('properties', with: '{"title":"change2"}')
      end
    end
  end

  context 'when adding features' do
    before do
       find('.button-edit').click
    end

    it 'adding a marker to the map' do
      find('.button-marker').click
      expect(page).to have_text('Click on a location to place a marker')
      expect { click_coord('#map', 50, 50) }.to change { Feature.point.count }.by(1)
      expect(page).to have_text('Feature added')
    end

    it 'adding a polygon to the map' do
      find('.button-polygon').click
      expect(page).to have_text('Click on a location on your map to start marking an area')
      click_coord('#map', 50, 50)
      click_coord('#map', 50, 150)
      click_coord('#map', 150, 150)
      click_coord('#map', 150, 50)
      click_coord('#map', 50, 50)

      expect(page).to have_text('Feature added')
      expect(Feature.polygon.count).to eq(1)

      # first click goes to edit mode, second to view mode
      find('.button-edit').click
      find('.button-edit').click
      click_coord('#map', 100, 100)
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text(Feature.first.id.to_s)
    end
  end
end
