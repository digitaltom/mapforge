require 'rails_helper'

describe 'Map' do
  subject(:map) { Map.create! }

  before do
    visit map_path(map)
  end

  context 'with initial map rendering' do
    it 'shows map edit buttons' do
      expect(page).to have_css('#map')
      expect(page).to have_css('.button-map')
    end
  end

  context 'when changing map properties' do
    it 'update gets saved' do
      find('.button-map').click
      expect(page).to have_text('Configure Map')
      find_all('.layer-preview ')[2].click
      sleep(1) # make sure actioncable request is processed
      expect(map.reload.base_map).to eq 'satelliteStreetTiles'
    end
  end

  context 'when sharing map' do
    before do
      find('.button-sharing').click
      expect(page).to have_text('Share Map')
    end

    it 'can share public link' do
      expect(page).to have_link('Viewer link', href: '/maps/' + subject.public_id)
    end

    it 'can share private link' do
      expect(page).to have_link('Edit link', href: '/maps/' + subject.id)
    end

    it 'can download geojson' do
      expect(page).to have_link('Download geojson', href: '/maps/' + subject.public_id + '/features')
    end

    it 'can download map export' do
      expect(page).to have_link('Download map export', href: '/maps/' + subject.public_id + '.json')
    end
  end
end
