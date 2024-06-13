class AdminController < ApplicationController
  # TODO: Find a better way to stub/authorize in selenium tests
  # :nocov:
  unless Rails.env.test?
    http_basic_authenticate_with name: ENV.fetch("ADMIN_USER", ""), password: ENV.fetch("ADMIN_PW", "")
  end
  # :nocov:

  def index
    @maps = Map.includes(layer: :features).order(updated_at: :desc)
  end

  def destroy
    Map.find_by(id: params[:id]).destroy!

    redirect_to admin_path, notice: "Map was deleted."
  end
end
