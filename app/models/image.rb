class Image
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps
  extend Dragonfly::Model

  # access with `img.url` (like /media/123..)
  # round icon: `thumb('150x').crop_quadrant.rounded.url´

  dragonfly_accessor :img
  field :img_uid, type: String

  validates_size_of :img, :maximum => 500.kilobytes

end
