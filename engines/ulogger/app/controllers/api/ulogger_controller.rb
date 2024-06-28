module Ulogger
  class Api::UloggerController < ApplicationController
    before_action :set_map, only: %i[addpos]

    JAVA_MAXINT = 2147483647

    def auth
      render json: { error: false }
    end

    def addtrack
      track_id, padded_id = create_numeric_map_id
      @map = Map.create!(id: padded_id, name: params[:track])
      @map.save!
      render json: { error: false, trackid: track_id }
    end

    def addpos
      geometry = { "type" => "Point",
                   "coordinates" => [ params[:lon], params[:lat], params[:altitude] ] }

      timestamp = Time.at(params[:time].to_i).to_datetime
      properties = { "title" => timestamp.to_s, "description" => description || "" }

      feature = Feature.new(geometry: geometry, properties: properties)
      feature.save!

      @map.features << feature
      @map.center = [ params[:lon], params[:lat] ]
      @map.save!

      render json: { error: false }
    end

    private

    def set_map
      @map =  Map.find_by(id: "%024d" % [ params[:trackid] ])
      render json: { error: true, message: "Invalid trackid" } unless @map
    end

    def description
      %i[accuracy speed bearing provider].filter_map do |key|
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
