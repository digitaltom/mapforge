class User
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  field :uid
  field :provider
  field :email
  field :admin
end
