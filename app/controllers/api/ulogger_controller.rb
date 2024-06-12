class Api::UloggerController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_map, only: %i[addpos]

  def auth
    render json: { error: false }
  end

  def addtrack
    @map = Map.find_by(name: params[:track]) || Map.create!(name: params[:track])

    trackid = @map.create_private_id
    @map.save!

    render json: { error: false, trackid: trackid }
  end

  def addpos
    geometry = { 'type' => 'Point',
                 'coordinates' => [ params[:lon], params[:lat], params[:altitude] ] }

    timestamp = Time.at(params[:time].to_i).to_datetime
    properties = { 'title' => timestamp.to_s, 'description' => "Accuracy: #{params[:accuracy]}" }

    feature = Feature.new(geometry: geometry, properties: properties)
    feature.save!

    @map.features << feature
    @map.center = [ params[:lon], params[:lat] ]
    @map.save!

    render json: { error: false }
  end

  private

  def set_map
    @map =  Map.find_by(private_id: params[:trackid].to_i)
    render json: { error: true } unless @map
  end
end
