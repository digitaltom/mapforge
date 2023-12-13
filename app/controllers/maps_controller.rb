class MapsController < ApplicationController
  before_action :set_map, only: %i[show edit update destroy features]

  # GET /maps or /maps.json
  def index
    @maps = Map.includes(:features).all
  end

  # GET /maps/1 or /maps/1.json
  def show
    gon.map_id = @map.id.to_s
  end

  # GET /maps/new
  def new
    @map = Map.new
  end

  # GET /maps/1/edit
  def edit; end

  # POST /maps or /maps.json
  def create
    @map = Map.new(map_params)

    respond_to do |format|
      if @map.save
        format.html { redirect_to map_url(@map), notice: 'Map was successfully created.' }
        format.json { render :show, status: :created, location: @map }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /maps/1 or /maps/1.json
  def update
    respond_to do |format|
      if @map.update(map_params)
        format.html { redirect_to map_url(@map), notice: 'Map was successfully updated.' }
        format.json { render :show, status: :ok, location: @map }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /maps/1 or /maps/1.json
  def destroy
    @map.destroy!

    respond_to do |format|
      format.html { redirect_to maps_url, notice: 'Map was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def features
    render json: @map.feature_collection.as_json
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_map
    @map = Map.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def map_params
    params.fetch(:map, {})
  end
end
