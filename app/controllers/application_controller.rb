class ApplicationController < ActionController::Base
  before_action :set_global_js_values, :set_user

  private

  def set_global_js_values
    gon.map_keys = Map.provider_keys
  end

  def set_user
    @user = User.find_by(uid: session[:uid]) if session[:uid]
  end
end
