class AdminController < ApplicationController
  http_basic_authenticate_with name: ENV.fetch("ADMIN_USER", ""), password: ENV.fetch("ADMIN_PW", "")

  def index
    @maps = Map.includes(layer: :features).order(updated_at: :desc)
  end

  def destroy
    Map.find_by(id: params[:id]).destroy!

    redirect_to admin_path, notice: "Map was deleted."
  end
end
