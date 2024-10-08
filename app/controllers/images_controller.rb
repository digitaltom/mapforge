class ImagesController < ApplicationController
  before_action :set_image, only: %i[icon image]

  def icon
    expires_in 60.minutes, public: true
    # resize, crop if necessary to maintain aspect ratio (centre gravity)
    image_url = @image.img.thumb("100x100#", quality: 95).rounded.url
    redirect_to image_url
  end

  def image
    expires_in 60.minutes, public: true
    image_url = @image.img.url
    redirect_to image_url
  end

  private

  def set_image
    @image = Image.find_by(public_id: params[:public_id])
    head :not_found unless @image
  end
end
