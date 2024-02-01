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
      expect(page).to have_css('.button-modify')
      expect(page).to have_css('.button-add')
    end
  end

  context 'with selected edit mode' do
    let!(:polygon) { create(:feature, :polygon_middle, map:, title: 'Poly Title') }

    before do
      find('.button-modify').click
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
  end

  context 'when adding features' do
    it 'can place a new point on the map' do
      find('.button-add').click
      find('.button-marker').click
      expect(page).to have_text('Click on a location to place a marker')
      expect { click_coord('#map', 50, 50) }.to change { Feature.point.count }.by(1)
      expect(page).to have_text('Feature added')
    end
  end
end
