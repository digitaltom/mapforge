class Api::UloggerController < ApplicationController
  skip_before_action :verify_authenticity_token

  def auth
    render json: { error: false }
  end

  def addtrack
    render json: { error: false, trackid: 666 }
  end

  def addpos
    render json: { error: false }
  end
end
