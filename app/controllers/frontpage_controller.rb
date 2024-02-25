class FrontpageController < ApplicationController
  def index
    @map = Map.frontpage
    raise 'Please define your frontpage map public_id in ENV["FRONTPAGE_MAP"]' unless @map
    gon.map_id = @map.public_id
    gon.map_mode = "static"
    gon.map_properties = @map.properties
    gon.map_keys = @map.keys
  end
end
