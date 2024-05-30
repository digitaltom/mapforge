FactoryBot.define do
  factory :map do
    base_map { 'osmDefaultTiles' }
    center { Map::DEFAULT_CENTER }
    # layer { create(:layer) }
  end
end
