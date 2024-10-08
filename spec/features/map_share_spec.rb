require 'rails_helper'

describe 'Map' do
  subject(:map) { create(:map) }

  context 'share links' do
    before do
      visit map_path(map)
      find('.maplibregl-ctrl-share').click
      expect(page).to have_text('Share Map')
    end

    it 'can share public link' do
      expect(page).to have_link('Viewer link', href: '/m/' + subject.public_id)
    end

    it 'can share private link' do
      expect(page).to have_link('Edit link', href: '/m/' + subject.id)
    end

    it 'can share geojson link' do
      expect(page).to have_link('Download geojson', href: '/m/' + subject.public_id + '/features')
    end

    it 'can share map export link' do
      expect(page).to have_link('Download map export', href: '/m/' + subject.public_id + '/export')
    end
  end

  context 'export' do
    it 'can download geojson export' do
      visit '/m/' + subject.public_id + '/features'
      expect(page).to have_text(map.feature_collection.to_json)
    end

    it 'can download map export' do
      visit '/m/' + subject.public_id + '/export'
      expect(page).to have_text(map.to_json)
    end
  end
end
