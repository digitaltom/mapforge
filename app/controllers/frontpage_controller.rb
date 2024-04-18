class FrontpageController < ApplicationController
  def index
    @map = Map.frontpage
    raise "Please see the README.md how to import the maps for the frontpage" unless @map
    gon.map_id = @map.public_id
    gon.map_mode = "static"
    gon.map_properties = @map.properties
    gon.map_keys = @map.keys
  end

  def deck
    @map = Map.frontpage
    gon.map_id = @map.public_id
    gon.map_mode = "static"
    gon.map_properties = @map.properties
    gon.map_keys = @map.keys
  end

  def maplibre
    @map = Map.frontpage
    gon.map_id = @map.public_id
    gon.map_mode = "static"
    gon.map_properties = @map.properties
    gon.map_keys = @map.keys
  end
end
