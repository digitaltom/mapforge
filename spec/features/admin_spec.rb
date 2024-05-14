require 'rails_helper'

describe 'Admin List' do
  let!(:maps) { create_list(:map, 3) }

  before do
    ENV["ADMIN_USER"] = "test"
    ENV["ADMIN_PW"] = "test"
    visit "http://#{ENV["ADMIN_USER"]}:#{ENV["ADMIN_PW"]}@localhost:#{Capybara.server_port}#{admin_path}"
  end

  it 'shows private links to maps' do
    expect(page).to have_selector(:xpath, "//a[@href='/m/#{maps[0].id}']")
  end

  it 'shows link to destroy map' do
    find('button', text: "Delete", match: :first).click
    expect(page).to have_text('Mapforge')
    expect(Map.count).to eq(2)
  end
end
