FactoryBot.define do
  factory :feature do
    type { 'Feature' }
    geometry { {} }
    properties { {} }
    map

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
          'coordinates' => [ 1_230_716.451640251, 6_355_538.0375163015 ] }
      end
    end

    # this polygon overlaps the whole default view (nbg)
    trait :polygon_fullscreen do
      geometry do
          { 'type' => 'Polygon',
            'coordinates' =>
          [ [ [ 1194064.8965775094, 6380547.493717699 ],
                [ 1194982.1409169314, 6317832.649420605 ],
                [ 1281355.9828791805, 6318444.501560088 ],
                [ 1280744.486652899, 6380088.604613086 ],
                [ 1194064.8965775094, 6380547.493717699 ] ] ] }
      end
    end

    # this polygon is in the middle of nbg (default view)
    trait :polygon_middle do
      geometry do
          { 'type' => 'Polygon',
            'coordinates' =>
          [ [ [ 1229034.8370179771, 6354390.814754769 ],
          [ 1228996.6185038346, 6347889.885772753 ],
          [ 1239009.8692091927, 6347851.6450140355 ],
          [ 1239009.8692091927, 6354467.296272204 ],
          [ 1229034.8370179771, 6354390.814754769 ] ] ] }
      end
    end

    trait :line_string do
      geometry do
        { 'type' => 'LineString',
          'coordinates' =>
        [ [ 1_229_149.492560405, 6_356_914.70483014 ], [ 1_230_831.1071826788, 6_353_817.203374003 ] ] }
      end
    end
  end
end
