require 'rails_helper'

describe 'Map' do
  subject(:map) { create(:map) }

  context 'share links' do
    before do
      visit map_path(map)
      find('.maplibregl-ctrl-share').click
      expect(page).to have_text('Share Map')
    end

    it 'has share public link' do
      expect(page).to have_link('Viewer link', href: '/m/' + subject.public_id)
    end

    it 'has share private link' do
      expect(page).to have_link('Edit link', href: '/m/' + subject.id)
    end

    it 'has share geojson link' do
      expect(page).to have_link('Download geojson', href: '/m/' + subject.public_id + '.geojson')
    end

    it 'has share gpx link' do
      expect(page).to have_link('Download gpx', href: '/m/' + subject.public_id + '.gpx')
    end

    it 'has share map export link' do
      expect(page).to have_link('Download map export', href: '/m/' + subject.public_id + '.json')
    end
  end

  context 'export' do
    it 'can download geojson export' do
      visit '/m/' + subject.public_id + '.geojson'
      expect(page).to have_text(map.to_geojson.to_json)
    end

    it 'can download map export' do
      visit '/m/' + subject.public_id + '.json'
      expect(page).to have_text(map.to_json)
    end

    it 'can download gpx export' do
      visit '/m/' + subject.public_id + '.gpx'
    end
  end
end
