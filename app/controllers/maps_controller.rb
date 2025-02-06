class MapsController < ApplicationController
  before_action :set_global_js_values, only: %i[show]
  before_action :set_map, only: %i[show properties destroy]
  before_action :require_login, only: %i[my]
  before_action :require_map_owner, only: %i[destroy]

  layout "map", only: [ :show ]

  def index
    @maps = Map.where.not(private: true).includes(:layers, :user).order(updated_at: :desc)
  end

  def my
    @maps = Map.where(user: @user).includes(:layers, :user).order(updated_at: :desc)
  end

  def show
    if request.format.html?
      @map_properties = @map.properties
      gon.map_id = params[:id]
      gon.map_mode = (params[:id] == @map.id.to_s) ? "rw" : "ro"
      gon.map_mode = "static" if params["static"]
      @map_mode = gon.map_mode
      gon.csrf_token = form_authenticity_token
      gon.map_properties = @map_properties
    end

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

  # :nocov:
  def properties
    render json: @map.properties.as_json
  end
  # :nocov:

  # some maplibre style tries to load eg. /atm_11; catching those calls here
  # :nocov:
  def catchall
    head :ok
  end
  # :nocov:

  # Turbo sends the DELETE request automatically with Content-Type: text/vnd.turbo-stream.html
  # We can return a turbo stream command that removes the map element in place
  # To avoid turbo_stream response, force format :html
  def destroy
    @map.destroy!
    # there is an additional broadcast from the model, for the admin page
    render turbo_stream: turbo_stream.remove(@map)
  end

  private

  def require_map_owner
    redirect_to maps_path unless @user&.admin? || (@map.user && @map.user == @user)
  end

  def set_global_js_values
    gon.map_keys = Map.provider_keys
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_map
    @map = Map.includes(:layers, :user)
    @map = @map.find_by(public_id: params[:id]) || @map.find_by(id: params[:id])
    head :not_found unless @map
  end

  # Only allow a list of trusted parameters through.
  def map_params
    params.fetch(:map, {})
  end
end
