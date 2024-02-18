require 'rails_helper'

describe 'Frontpage' do
  let!(:map) { create(:map, public_id: 'frontpage') }

  before do
    visit root_path
  end

  it 'shows frontpage map' do
    expect(page).to have_selector(:xpath, "//div[@id='map']")
  end
end
