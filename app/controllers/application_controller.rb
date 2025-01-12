class ApplicationController < ActionController::Base
  before_action :set_global_js_values, :set_user

  def not_found!
    render file: "#{Rails.root}/public/404.html", layout: false, status: :not_found
  end

  private

  def set_global_js_values
    gon.map_keys = Map.provider_keys
  end

  def set_user
    @user = User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def require_login
    not_found! unless @user
  end
end
