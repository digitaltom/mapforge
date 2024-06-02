class ApplicationController < ActionController::Base
  before_action :set_global_js_values

  private

  def set_global_js_values
    gon.map_keys = Map.provider_keys
  end
end
