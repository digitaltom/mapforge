class AdminController < ApplicationController
  http_basic_authenticate_with name: ENV["ADMIN_USER"], password: ENV["ADMIN_PW"]

  def index
    gon.map_keys = Map.provider_keys
    @maps = Map.includes(layer: :features).order(updated_at: :desc)
  end
end
