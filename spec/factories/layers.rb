FactoryBot.define do
  factory :layer do
    trait :with_features do
      features { [ FactoryBot.create(:feature, :line_string),
        FactoryBot.create(:feature, :point) ] }
    end
  end
end
