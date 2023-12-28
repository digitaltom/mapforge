require 'rails_helper'

describe 'Map' do
  let!(:map) { Map.create! }

  before do
    visit map_path(id: map.id.to_s)
  end

  context 'with initial map rendering' do
    it 'shows map' do
      expect(page).to have_css('#map')
    end
  end
end
