class Layer
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :map, optional: true, touch: true
  has_many :features, dependent: :destroy

  field :features_count, type: Integer, default: 0

  def clone_with_features
    clone = self.dup
    clone.update(created_at: DateTime.now, map: nil)
    features.each { |f| clone.features << f.dup }
    clone
  end
end
