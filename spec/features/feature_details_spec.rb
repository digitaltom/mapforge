require 'rails_helper'

describe 'Feature details' do
  let(:map) { create(:map) }

  before do
    visit map_path(id: map.public_id)
    expect(page).to have_css("#maplibre-map[data-loaded='true']")
  end

  context 'with polygon on map' do
    let!(:polygon) { create(:feature, :polygon_middle, layer: map.layer, title: 'Poly Title') }

    context 'with selected feature' do
      before do
        click_coord('#maplibre-map', 50, 50)
        expect(page).to have_css('#feature-details-modal')
      end

      it 'can enlarge modal' do
        find('.modal-pull-button').click
        height = find('#feature-details-modal').native.style('height').sub('px', '').to_i
        expect(height).to be > 400
      end
    end
  end
end
