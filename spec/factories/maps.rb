FactoryBot.define do
  factory :map do
    base_map { 'empty' }
    center { Map::DEFAULT_CENTER }
  end
end
