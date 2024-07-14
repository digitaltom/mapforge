class MapsController < ApplicationController
  before_action :set_map, only: %i[show features properties]

  def index
    @maps = Map.where.not(private: true).includes(layer: :features).order(updated_at: :desc)
  end

  def show
    @map_properties = @map.properties
    gon.map_id = params[:id]
    gon.map_mode = (params[:id] == @map.id.to_s) ? "rw" : "ro"
    gon.map_mode = "static" if params["static"]
    gon.map_properties = @map_properties

    respond_to do |format|
      format.html do
        case params["engine"]
        when "deck"
          render "deck"
        else
          render "maplibre"
        end
      end
      format.json { render json: @map.to_json }
    end
  end

  def create
    @map = Map.create!(map_params)

    redirect_to map_url(@map), notice: "Map was successfully created."
  end

  def features
    render json: @map.feature_collection
  end

  def properties
    render json: @map.properties.as_json
  end

  # some maplibre style tries to load eg. /atm_11; catching those calls here
  # :nocov:
  def catchall
    head :ok
  end
  # :nocov:

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_map
    @map = Map.find_by(public_id: params[:id]) || Map.find_by(id: params[:id])
    head :not_found unless @map
  end

  # Only allow a list of trusted parameters through.
  def map_params
    params.fetch(:map, {})
  end
end
