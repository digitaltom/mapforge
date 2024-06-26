require 'rails_helper'

describe 'Images' do
  before do
    visit icon_path(public_id: image.public_id)
  end

  let(:image) { Image.create(img: File.new(Rails.root.join('db/seeds/frontpage/icons/2024-04-04_00-14.png'))) }

  it 'redirects to image' do
    image_url = image.img.thumb("100x100#", quality: 95).rounded.url
    expect(page.current_url).to include(image_url)
  end
end
