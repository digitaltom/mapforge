FactoryBot.define do
  factory :feature do
    type { 'Feature' }
    geometry { {} }
    properties { {} }
    association :layer

    transient do
      coordinates { nil }
      title { nil }
      description { nil }
    end

    after :build do |feature, evaluator|
      feature.geometry['coordinates'] = evaluator.coordinates if evaluator.coordinates
      feature.properties['title'] = evaluator.title if evaluator.title
      feature.properties['description'] = evaluator.description if evaluator.description
    end

    # the following traits are visible in the default view of the map (in nbg)
    trait :point do
      geometry do
        { 'type' => 'Point',
          'coordinates' => [ 11.0557138, 49.4731983 ] }
      end
    end

    # this polygon is in the middle of nbg (default view)
    trait :polygon_middle do
      geometry do
          { 'type' => 'Polygon',
            'coordinates' =>
            [ [ [ 11.0406078, 49.4665013 ],
            [ 11.0402645, 49.4285336 ],
            [ 11.130215, 49.4283102 ],
            [ 11.130215, 49.4669478 ],
            [ 11.0406078, 49.4665013 ] ] ]
          }
      end
    end

    trait :line_string do
      geometry do
        { 'type' => 'LineString',
          'coordinates' =>
        [ [ 11.0416378, 49.4812338 ], [ 11.056744, 49.4631524 ] ] }
      end
    end
  end
end
