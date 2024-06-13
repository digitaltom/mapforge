require 'rails_helper'

describe 'Map List' do
  let!(:maps) { create_list(:map, 3) }

  before do
    visit maps_path
  end

  it 'shows links to maps' do
    expect(page).to have_selector(:xpath, "//a[@href='/m/#{maps[0].public_id}']")
  end
end
