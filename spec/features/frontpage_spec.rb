require 'rails_helper'

describe 'Frontpage' do
  before do
    # create empty map for frontpage tour
    map = Map.create_from_file("db/seeds/frontpage/frontpage.json")
    map.update(base_map: 'test')
    map.dup.update(public_id: 'frontpage-category-friends')
    map.dup.update(public_id: 'frontpage-category-office')
    map.dup.update(public_id: 'frontpage-category-data')

    visit root_path
  end

  it 'shows frontpage map' do
    expect(page).to have_selector(:xpath, "//div[@id='frontpage-map']")
    expect(page).to have_text('mapforge')
  end

  it 'shows tour' do
    expect(page).to have_css('#frontpage-map[data-loaded="true"]')
    # It can take a while for the text to show
    expect(page).to have_selector(:css, "*", text: 'map your friends',
      visible: :all, wait: 30)
    expect(page).to have_link('explore')
    expect(page).to have_link('create')
  end

  context 'when clicking create' do
    it 'user can create new map' do
      click_link('create')
      expect(page).to have_css('#maplibre-map')
      expect(page).to have_css('.mapbox-gl-draw_point')
    end
  end

  context 'when clicking explore' do
    it 'user gets to map listing' do
      click_link('explore')
      expect(page).to have_css('#maps')
    end
  end
end


describe 'Frontpage rake task' do
  before do
    capture_stdout do
      Rails.application.load_tasks
      Rake::Task['seed:frontpage'].invoke
    end
  end

  it 'makes frontpage functional' do
    expect(Map.find_by(public_id: 'frontpage').present?).to be_truthy
    expect(Map.find_by(public_id: 'frontpage-category-friends').present?).to be_truthy
    expect(Map.find_by(public_id: 'frontpage-category-office').present?).to be_truthy
    expect(Map.find_by(public_id: 'frontpage-category-data').present?).to be_truthy
  end
end
