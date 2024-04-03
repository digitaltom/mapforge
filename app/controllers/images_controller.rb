class ImagesController < ApplicationController
  before_action :set_image, only: %i[icon]

  def icon
    image_url = @image.img.thumb("50x").crop_quadrant.sharpen(0.5).rounded.url
    redirect_to image_url
  end

  def set_image
    @image = Image.find_by(public_id: params[:public_id])
    head :not_found unless @image
  end
end
