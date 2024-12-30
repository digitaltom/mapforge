class SessionsController < ApplicationController
  layout "content"

  def new
    render :new
  end

  def logout
    session[:uid] = nil
    redirect_to root_path
  end

  def developer
    render :developer
  end

  def create
    user_info = request.env["omniauth.auth"]
    user = User.find_or_create_by(uid: user_info.uid, provider: user_info.provider)
    user.update!(email: user_info.info.email, name: user_info.info.email, image: user_info.info.image)
    # Make first user admin
    user.update!(admin: true) if User.count == 1
    session[:uid] = user_info.uid
    redirect_to root_path
  end
end
