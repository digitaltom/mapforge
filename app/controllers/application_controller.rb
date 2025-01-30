class ApplicationController < ActionController::Base
  before_action :set_user
  before_action :disable_session_cookies

  private

  def set_user
    @user = User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def require_login
    redirect_to login_path unless @user
  end

  def disable_session_cookies
    request.session_options[:skip] = true unless @user
  end
end
