require 'rails_helper'

describe ImagesController do
  let(:image) { Image.create(img: File.new(Rails.root.join('db/seeds/frontpage/icons/2024-04-04_00-14.png'))) }

  describe '#image' do
   it 'redirects to image' do
     image_url = image.img.url
     expect(get image_path(public_id: image.public_id)).to redirect_to(image_url)
   end
  end

  describe '#icon' do
    it 'redirects to icon' do
      image_url = image.img.thumb("100x100#", quality: 95).rounded.url
      expect(get icon_path(public_id: image.public_id)).to redirect_to(image_url)
    end
  end
end
