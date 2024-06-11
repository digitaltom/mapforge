FactoryBot.define do
  factory :map do
    base_map { 'osmRasterTiles' }
    center { Map::DEFAULT_CENTER }
  end
end
