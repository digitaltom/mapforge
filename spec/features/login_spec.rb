require 'rails_helper'

describe 'Login' do
  before do
    visit login_path
  end

  it 'shows login options' do
    expect(page).to have_button('Login with Github')
  end
end
