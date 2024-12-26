class User
  include ActiveModel::Model
  include Mongoid::Document
  include Mongoid::Timestamps

  field :username
  field :email
  field :admin
end
