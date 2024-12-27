class SessionsController < ApplicationController
  layout "content"

  def new
    render :new
  end

  def developer
    render :developer
  end

  def create
    user_info = request.env["omniauth.auth"]
    # TODO add user sign up
    Rails.logger.debug user_info.inspect
    # redirect_to root_path
  end
end
