class MapsController < ApplicationController
  before_action :set_map, only: %i[show properties]

  layout "content", only: [ :index ]
  layout "map", only: [ :show ]

  def index
    @maps = Map.where.not(private: true).includes(:layers).order(updated_at: :desc)
  end

  def show
    @map_properties = @map.properties
    gon.map_id = params[:id]
    gon.map_mode = (params[:id] == @map.id.to_s) ? "rw" : "ro"
    gon.map_mode = "static" if params["static"]
    @map_mode = gon.map_mode
    gon.csrf_token = form_authenticity_token
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
      format.geojson { render json: @map.to_geojson }
      format.gpx { send_data @map.to_gpx, filename: @map.public_id + ".gpx" }
    end
  end

  def create
    @map = Map.create!(map_params)
    @map.update(user: @user)

    redirect_to map_url(@map), notice: "Map was successfully created."
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
