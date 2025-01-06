require 'rails_helper'

describe 'Frontpage' do
  before do
    visit root_path
  end

  it 'shows description' do
    expect(page).to have_text('Create your own maps')
  end
end
