class FrontpageController < ApplicationController
  layout "frontpage"

  def index
    @map = Map.frontpage
    raise "Please see the README.md how to import the maps for the frontpage" unless @map
    gon.map_id = @map.public_id
    gon.map_mode = "static"
    gon.map_properties = @map.properties
  end
end
