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

  context 'with features' do
    let!(:point) { create(:feature, :point, map:) }
    # this polygon overlaps the whole default view
    let!(:polygon) { create(:feature, :polygon_fullscreen, map:, title: 'Poly Title') }
    let!(:line) { create(:feature, :line_string, map:) }

    it 'shows features on map' do
      expect(page).to have_css('.ol-layer')
      expect(page).to have_text('Connection to server established')
    end

    it 'shows feature details on hover' do
      map = find('#map')
      page.driver.browser.action.move_to(map.native, 50, 50).click.perform
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Area: 2270.13 km')
    end

    it 'shows feature details on click' do
      map = find('#map')
      sleep(0.5) # wait for features to be loaded
      page.driver.browser.action.move_to(map.native, 50, 50).click.perform
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Area: 2270.13 km')
    end
  end

  context 'with selected edit mode' do
    # this polygon overlaps the whole default view
    let!(:polygon) { create(:feature, :polygon_fullscreen, map:, title: 'Poly Title') }

    before do
      find('.button-modify').click
    end

    it 'shows flash hint' do
      expect(page).to have_text('Click on a map element to modify it')
    end

    context 'with selected feature' do
      before do
        map = find('#map')
        page.driver.browser.action.move_to(map.native, 50, 50).click.perform
      end

      it 'shows feature details' do
        expect(page).to have_css('.feature-details-edit')
        expect(page).to have_text(polygon.id)
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
      expect { find_by_id('map').click }.to change { Feature.point.count }.by(1)
      expect(page).to have_text('Feature added')
    end
  end
end
