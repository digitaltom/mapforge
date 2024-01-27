namespace :animation do
  desc "Animate a point along a line"
  task :nbg, %i[mapid] => :environment do |_, args|
    map = Map.find(args.fetch(:mapid))
    # line
    linestring_geojson = { "type" => "LineString",
                           "coordinates" => [ [ 1_232_121.571619268, 6_351_119.445097622 ], [ 1_232_256.8144262778, 6_351_097.941508011 ],
                                             [ 1_232_450.2956541248, 6_351_076.431081233 ], [ 1_232_658.108824775, 6_351_052.5306070335 ],
                                             [ 1_232_834.8694526844, 6_351_033.410227675 ], [ 1_233_006.8527663262, 6_351_016.679895735 ],
                                             [ 1_233_171.670108566, 6_350_995.169468957 ], [ 1_233_295.8802795294, 6_350_978.439137018 ],
                                             [ 1_233_440.1103571875, 6_350_995.16263179 ], [ 1_233_549.077935724, 6_351_023.850037996 ],
                                             [ 1_233_612.0936708292, 6_351_081.2043389045 ], [ 1_233_661.344821018, 6_351_181.593167706 ],
                                             [ 1_233_727.158548802, 6_351_380.759555619 ], [ 1_233_789.2636342836, 6_351_548.062875009 ],
                                             [ 1_233_822.7048341583, 6_351_653.224961483 ], [ 1_233_863.312005435, 6_351_715.366194399 ],
                                             [ 1_233_887.198576774, 6_351_746.436810858 ], [ 1_234_106.5713624416, 6_351_974.8906692965 ],
                                             [ 1_234_142.3755545574, 6_352_018.102927489 ], [ 1_234_186.9075508753, 6_352_125.041924859 ],
                                             [ 1_234_235.558847673, 6_352_247.35607516 ], [ 1_234_285.6949825922, 6_352_362.269755949 ],
                                             [ 1_234_385.3100126744, 6_352_449.715021113 ], [ 1_234_443.3463534303, 6_352_534.353170179 ],
                                             [ 1_234_462.0294715127, 6_352_640.506931841 ], [ 1_234_452.474842977, 6_352_764.789397675 ],
                                             [ 1_234_452.900981966, 6_352_859.399619279 ], [ 1_234_344.3963881773, 6_352_977.242146096 ],
                                             [ 1_234_234.5181600174, 6_353_106.304706769 ], [ 1_234_150.9151603305, 6_353_178.0061293645 ],
                                             [ 1_234_099.379726147, 6_353_217.906732258 ], [ 1_233_978.2440188914, 6_353_206.017221323 ],
                                             [ 1_233_851.645190794, 6_353_189.2868893845 ], [ 1_233_707.6399561856, 6_353_146.205309663 ],
                                             [ 1_233_583.429785222, 6_353_064.943697387 ], [ 1_233_447.9621351615, 6_353_086.51485033 ],
                                             [ 1_233_335.0094432954, 6_353_084.064076747 ], [ 1_233_307.0313642607, 6_353_074.5646132305 ],
                                             [ 1_233_167.8034439215, 6_353_055.383507708 ], [ 1_233_080.1089365392, 6_353_091.294945169 ],
                                             [ 1_232_922.457565701, 6_353_117.585466787 ], [ 1_232_836.46590888, 6_353_124.755609048 ],
                                             [ 1_232_737.8451598175, 6_353_079.283981906 ], [ 1_232_657.3166238365, 6_352_998.0830957955 ],
                                             [ 1_232_633.4300524974, 6_352_931.16176804 ], [ 1_232_597.6001954887, 6_352_861.850392863 ],
                                             [ 1_232_561.084531908, 6_352_825.938955402 ], [ 1_232_494.8879387304, 6_352_780.588780591 ],
                                             [ 1_232_369.991961195, 6_352_682.53611021 ], [ 1_232_358.7344820965, 6_352_575.044702487 ],
                                             [ 1_232_320.515967954, 6_352_376.6707666395 ], [ 1_232_287.0747680785, 6_352_212.2380843805 ],
                                             [ 1_232_203.648214482, 6_351_994.62684156 ], [ 1_232_091.7912527744, 6_351_887.778346249 ],
                                             [ 1_231_996.244967418, 6_351_804.1266865535 ], [ 1_231_945.6732440195, 6_351_750.842004735 ],
                                             [ 1_231_888.7553963917, 6_351_643.993509425 ], [ 1_231_776.4885110976, 6_351_514.930948753 ],
                                             [ 1_231_706.8075306283, 6_351_440.135840153 ], [ 1_231_680.9422257412, 6_351_383.47834066 ],
                                             [ 1_231_745.435968357, 6_351_311.776918065 ], [ 1_231_731.1040255534, 6_351_256.805827408 ],
                                             [ 1_231_879.2007678559, 6_351_209.004879011 ], [ 1_232_098.5473005902, 6_351_124.649580732 ] ] }
    linestring = RGeo::GeoJSON.decode(linestring_geojson)

    # point
    point = map.features.find_or_create_by(id: "#{args.fetch(:mapid)}_point")
    i = 0
    # animate
    loop do
      linepoint = linestring.points[i]
      i += 1
      puts "Moving to: #{linepoint}"
      point.update(geometry: { "type" => "Point", "coordinates" => linepoint.coordinates })
      sleep 0.3
      i = 0 if i >= linestring.points.size
    end
  end
end
