class Api::UloggerController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_map, only: %i[addpos]

  JAVA_MAXINT = 2147483647

  def auth
    render json: { error: false }
  end

  def addtrack
    track_id = create_numeric_map_id

    @map = Map.create!(id: track_id, name: params[:track])
    @map.save!

    render json: { error: false, trackid: track_id }
  end

  def addpos
    geometry = { 'type' => 'Point',
                 'coordinates' => [ params[:lon], params[:lat], params[:altitude] ] }

    timestamp = Time.at(params[:time].to_i).to_datetime
    properties = { 'title' => timestamp.to_s, 'description' => description || '' }

    feature = Feature.new(geometry: geometry, properties: properties)
    feature.save!

    @map.features << feature
    @map.center = [ params[:lon], params[:lat] ]
    @map.save!

    render json: { error: false }
  end

  private

  def set_map
    @map =  Map.find_by(id: params[:trackid].to_i)
    render json: { error: true } unless @map
  end

  def description
    %i[accuracy speed bearing provider].filter_map do |key|
      val = params.fetch(key, nil)
      "#{key.to_s.humanize}: #{val}" if val.present?
    end.join("\n")
  end

  def create_numeric_map_id
    id = nil

    loop do
      id = SecureRandom.rand(1..JAVA_MAXINT)
      break unless Map.where(id: id).where.not(id: id).exists?
    end

    id
  end

end
