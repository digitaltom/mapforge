FactoryBot.define do
  factory :map do
    base_map { 'osmDefaultTiles' }
    # layer { create(:layer) }
  end
end
