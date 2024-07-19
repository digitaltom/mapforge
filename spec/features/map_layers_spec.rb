require 'rails_helper'

describe 'Map' do
  subject(:map) { create(:map) }

  before do
    visit map_path(map)
    expect(page).to have_css("#maplibre-map[data-loaded='true']")
  end

  context 'with initial map rendering' do
    it 'shows map layers button' do
      expect(page).to have_css('#maplibre-map')
      expect(page).to have_css('.maplibregl-ctrl-layers')
    end
  end

  context 'feature listing' do
    before do
      feature
      expect(page).to have_text('Added feature')
      expect(page).to have_text('Map view updated')
      find('.maplibregl-ctrl-layers').click
    end
    let(:feature) { create(:feature, :point, title: 'Feature 1', desc: 'F1 desc', layer: map.layer) }

    it 'lists all features' do
      expect(page).to have_text('Feature 1')
    end

    it 'flies to feature on click' do
      find("i[data-feature-id='#{feature.id}']").click
      # flyTo is finished when the feature details are shown
      expect(page).to have_text('F1 desc')
      expect(page.evaluate_script("[map.getCenter().lng, map.getCenter().lat].toString()"))
        .to eq(feature.coordinates.join(','))
    end

    context 'file upload' do
      it 'import geojson' do
        attach_file("fileInput", Rails.root.join("spec", "fixtures", "files", "features.json"))
        click_button "Import gpx/kml"
        expect(page).to have_text('Import1')
        expect(map.reload.features.count).to eq 4
      end
    end
  end
end
