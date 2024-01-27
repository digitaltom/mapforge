require 'rails_helper'

describe 'Map' do
  let(:map) { create(:map) }

  before do
    visit map_path(map)
    expect(page).to have_text('Connection to server established')
  end

  context 'with initial map rendering' do
    it 'shows map view buttons' do
      expect(page).to have_css('#map')
      expect(page).to have_css('.button-select')
      expect(page).to have_css('.button-locate')
    end
  end

  context 'with features' do
    let!(:point) { create(:feature, :point, map:) }
    # this polygon overlaps the whole default view
    let!(:polygon) { create(:feature, :polygon_fullscreen, map:, title: 'Poly Title',
      description: 'Poly Desc') }
    let!(:line) { create(:feature, :line_string, map:) }

    it 'shows features on map' do
      expect(page).to have_css('.ol-layer')
      expect(page).to have_text('Connection to server established')
    end

    it 'shows feature details on hover' do
      map = find('#map')
      page.driver.browser.action.move_to(map.native, 50, 50).perform
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('Area: 2270.13 km')
    end

    it 'shows feature details on click' do
      map = find('#map')
      page.driver.browser.action.move_to(map.native, 50, 50).click.perform
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('Area: 2270.13 km')
    end
  end
end
