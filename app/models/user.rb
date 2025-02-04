class User
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  has_many :maps

  field :uid
  field :provider
  field :name
  field :email
  field :image
  field :admin
  field :maps_count, type: Integer, default: 0
  field :images_count, type: Integer, default: 0
end
