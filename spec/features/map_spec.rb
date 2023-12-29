require 'rails_helper'

describe 'Map' do
  let!(:map) { Map.create! }

  before do
    visit map_path(id: map.id.to_s)
  end

  context 'with initial map rendering' do
    it 'shows map buttons' do
      expect(page).to have_css('#map')
      expect(page).to have_css('.button-select')
      expect(page).to have_css('.button-modify')
      expect(page).to have_css('.button-marker')
      expect(page).to have_css('.button-line')
      expect(page).to have_css('.button-polygon')
    end
  end
end
