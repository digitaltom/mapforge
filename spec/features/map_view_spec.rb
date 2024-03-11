require 'rails_helper'

describe 'Map' do
  let(:map) { create(:map) }

  before do
    visit map_path(map)
    sleep(1) # make sure features are loaded from server
    expect(page).to have_text('Connection to server established')
  end

  context 'with initial map rendering' do
    it 'shows map view buttons' do
      expect(page).to have_css('#map')
      expect(page).to have_css('.button-home')
      expect(page).to have_css('.button-locate')
    end
  end

  context 'with features' do
    let!(:point) { create(:feature, :point, layer: map.layer) }
    # this polygon overlaps the whole default view
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layer, title: 'Poly Title',
      description: 'Poly Desc') }
    let!(:line) { create(:feature, :line_string, layer: map.layer) }

    it 'shows features on map' do
      expect(page).to have_css('.ol-layer')
      expect(page).to have_text('Connection to server established')
    end

    it 'shows feature details on hover' do
      hover_coord('#map', 0, 0)
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('Area: 27.64 km')
    end

    it 'shows feature details on click' do
      click_coord('#map', 50, 50)
      expect(page).to have_css('.feature-details-view')
      expect(page).to have_text('Poly Title')
      expect(page).to have_text('Poly Desc')
      expect(page).to have_text('Area: 27.64 km')
    end
  end
end
