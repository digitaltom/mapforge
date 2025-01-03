require 'rails_helper'

describe 'Login' do
  before do
    # create empty map for frontpage tour
    Map.create_from_file("db/seeds/frontpage/frontpage.json")
    Map.find_by(public_id: 'frontpage').dup.update(public_id: 'frontpage-category-friends')
    Map.find_by(public_id: 'frontpage').dup.update(public_id: 'frontpage-category-office')
    Map.find_by(public_id: 'frontpage').dup.update(public_id: 'frontpage-category-data')

    visit login_path
  end

  it 'shows login options' do
    expect(page).to have_button('Developer Login')
  end

  it 'login via developer provider' do
    click_button('Developer Login')
    fill_in 'name', with: 'Test User'
    fill_in 'email', with: 'test@mapforge.org'
    click_button('Sign In')
    expect(page).to have_text('map your friends')
    expect(User.count).to eq 1
  end

  it 'destroys session on logout' do
    click_button('Developer Login')
    fill_in 'name', with: 'Test User'
    fill_in 'email', with: 'test@mapforge.org'
    click_button('Sign In')
    expect(page).to have_text('map your friends')
    expect(User.count).to eq 1
    visit maps_path
    find('.profile-image').click
    click_link('Logout')
    expect(page).to have_text('map your friends')
  end
end
