module Ulogger
  class Api::UloggerController < ApplicationController
    before_action :set_map, only: %i[addpos]

    JAVA_MAXINT = 2147483647

    def auth
      render json: { error: false }
    end

    def addtrack
      map_id, padded_id = create_numeric_map_id
      @map = Map.create!(id: padded_id, name: params[:track],
                         public_id: params[:track], private: true)
      @map.save!
      render json: { error: false, trackid: map_id }
    end

    def addpos
      coords = [ params[:lon].to_f, params[:lat].to_f, params[:altitude].to_f ]

      # if the map has no track yet, create one, else append
      track = @map.features.line_string.first
      track = Feature.new(layer: @map.layer, geometry: { 'coordinates' => [] }) unless track
      track_coords = track.geometry['coordinates'] << coords
      track.update(geometry: { "type" => "LineString",
                               "coordinates" => track_coords })

      # add point with details
      geometry = { "type" => "Point", "coordinates" => coords }

      timestamp = Time.at(params[:time].to_i).to_datetime.strftime("%Y-%m-%d %H:%M:%S")
      properties = { "title" => timestamp, "desc" => description || "" }

      @map.features.create!(geometry: geometry, properties: properties)
      @map.update!(center: [ params[:lon].to_f, params[:lat].to_f ])

      render json: { error: false }
    end

    private

    def set_map
      @map =  Map.find_by(id: "%024d" % [ params[:trackid] ])
      render json: { error: true, message: "Invalid trackid" } unless @map
    end

    def description
      %i[accuracy speed bearing provider altitude].filter_map do |key|
        val = params.fetch(key, nil)
        "#{key.to_s.humanize}: #{val}" if val.present?
      end.join("\n")
    end

    # mongoid needs a BSON::ObjectId (24 char hex) as primary key,
    # which we use as map id currently
    def create_numeric_map_id
      id = SecureRandom.rand(1..JAVA_MAXINT)
      padded = "%024d" % [ id ]
      return create_numeric_map_id if Map.exists?(id: padded)
      [ id, padded ]
    end
  end
end
