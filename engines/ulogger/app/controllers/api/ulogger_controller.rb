module Ulogger
  class Api::UloggerController < ApplicationController
    before_action :set_map, only: %i[addpos]

    JAVA_MAXINT = 2147483647

    METADATA_FORMAT = [
      [ :altitude, '%.2f m' ],
      [ :speed, '%.1f km/h', ->(x) { x.to_f * 3.6 } ],
      [ :bearing, '%.1f°' ],
      [ :accuracy, '%.2f m' ],
      [ :provider, '%s' ],
      [ :comment, '%s' ]
    ]

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

      uploaded = params.fetch(:image, nil)

      if uploaded.is_a?(ActionDispatch::Http::UploadedFile)
        img = Image.create(img: uploaded.tempfile)
        image_properties = {
          "marker-color" => "transparent",
          "stroke" => "#fff",
          "marker-size" => "large",
          "marker-image-url" => "/icon/" + img.public_id,
          "stroke-width" => "3" }

        properties.merge!(image_properties)
      end

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
      METADATA_FORMAT.filter_map do |dtype|
        key, format, lambda = dtype
        val = params.fetch(key, nil)
        if val.present?
          val = lambda.call(val) if lambda
          "- %s: #{format}" % [ key.to_s.humanize, val ]
        end
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
