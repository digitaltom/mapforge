require 'rails_helper'

describe 'Map List' do
  let(:user) { create(:user) }

  before do
    allow_any_instance_of(ApplicationController).to receive(:session).and_return({ user_id: user.id })
    create(:map, user: user)
    visit my_path
  end

  it 'can delete own map' do
    expect(user.maps_count).to eq 1
    expect(page).to have_css(".map-preview")
    accept_alert do
      find(".map-delete", match: :first).click
    end
    expect(page).not_to have_css(".map-preview")
    expect(user.reload.maps_count).to eq 0
  end
end
