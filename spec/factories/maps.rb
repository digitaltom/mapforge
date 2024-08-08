FactoryBot.define do
  factory :map do
    base_map { 'test' }
    center { Map::DEFAULT_CENTER }
  end
end
