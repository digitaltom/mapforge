class MapsController < ApplicationController
  before_action :set_map, only: %i[show features]

  def index
    @maps = Map.where.not(public_id: nil).includes(:features).order(updated_at: :desc)
  end

  def show
    gon.map_id = params[:id]
    gon.map_mode = (params[:id] == @map.id.to_s) ? "rw" : "ro"
    gon.map_mode = "static" if params["static"]
    gon.map_properties = @map.properties
    gon.map_keys = @map.keys
  end

  def new
    @map = Map.new
  end

  def create
    @map = Map.new(map_params)
    @map.save!
    redirect_to map_url(@map), notice: "Map was successfully created."
  end

  def features
    render json: @map.feature_collection.as_json
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_map
    @map = Map.find_by(id: params[:id]) || Map.find_by(public_id: params[:id])
    redirect_to "/404.html" unless @map
  end

  # Only allow a list of trusted parameters through.
  def map_params
    params.fetch(:map, {})
  end
end
