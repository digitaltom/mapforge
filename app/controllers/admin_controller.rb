class AdminController < ApplicationController
  before_action :require_admin_user

  def index
    @maps = Map.includes(:layers).order(updated_at: :desc)
  end

  def destroy
    Map.find_by(id: params[:id]).destroy!

    redirect_to admin_path, notice: "Map was deleted."
  end

  private

  def require_admin_user
    redirect_to login_path unless @user&.admin?
  end
end
