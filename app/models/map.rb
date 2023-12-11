class Map
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  has_many :features, dependent: :destroy
end
