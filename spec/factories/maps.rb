FactoryBot.define do
  factory :map do
    base_map { 'osmDefaultTiles' }
    public_id { SecureRandom.hex(8) }
  end
end
