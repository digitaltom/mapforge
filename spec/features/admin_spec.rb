require 'rails_helper'

describe 'Admin List' do
  let!(:maps) { create_list(:map, 3) }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("ADMIN_USER", "").and_return("test")
    allow(ENV).to receive(:fetch).with("ADMIN_PW", "").and_return("test")

    visit admin_path
  end

  it 'shows private links to maps' do
    expect(page).to have_selector(:xpath, "//a[@href='/m/#{maps[0].id}']")
  end

  it 'shows link to destroy map' do
    find('button', text: "Delete", match: :first).click
    expect(page).to have_text('Mapforge')
    expect(Map.count).to eq(2)
  end

  context 'navigating from admin list to map' do
    it 'shows map in edit mode without errors' do
      find("img[class='preview-image']", match: :first).click
      expect(page).to have_selector(:xpath, "//button[@title='Map settings']")
    end
  end
end
