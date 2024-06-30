class TracksController < ApplicationController
  def redirect
    if params[:id]
      padded = "%024d" % [ params[:id] ]
      map = Map.find(padded)
      if map
        redirect_to map_path(id: map.public_id)
      else
        Rails.logger.warn("Ulogger map '#{params[:id]}' not found")
        render status: :not_found
      end
    end
  end
end
