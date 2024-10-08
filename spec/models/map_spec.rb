require 'rails_helper'

describe Map do
  describe '#to_json' do
    before { Map.create_from_file('db/seeds/frontpage/frontpage.json') }

    it 'included properties & layers' do
      expect(Map.find_by(public_id: 'frontpage').to_json).to be_kind_of(String)
    end
  end

  describe '#public_id_must_be_unique_or_nil' do
    context 'when map with same public_id already exists' do
      before { create(:map, public_id: 'frontpage') }

      it 'raises error' do
        expect { create(:map, public_id: 'frontpage') }
          .to raise_error(Mongoid::Errors::Validations, /has already been taken/)
      end
    end
  end

  describe '#properties' do
    context 'when map has no center defined' do
      before do
        map.features << point
        map.features << poly
        map.features << line
      end
      let(:map) { create(:map, center: nil) }
      let(:point) { create(:feature, :point_with_elevation) }
      let(:poly) { create(:feature, :polygon_middle) }
      let(:line) { create(:feature, :line_string) }

      it 'sets default center to midpoint of all features' do
        expect(map.properties[:default_center]).to eq [ 11.0670007125, 49.4592973375 ]
      end
    end

    context 'when map has no zoom defined' do
      let(:map) { create(:map, zoom: nil) }

      it 'sets default zoom to 12 on single point' do
        map.features << create(:feature, :point)
        expect(map.properties[:default_zoom]).to eq 12
      end

      it 'sets default zoom to 16' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 11.067, 49.459 ], [ 11.077, 49.459 ] ]))
        expect(map.properties[:default_zoom]).to eq 16
      end

      it 'sets default zoom to 14' do
        map.features << create(:feature, :line_string)
        expect(map.properties[:default_zoom]).to eq 14
      end

      it 'sets default zoom to 12' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 11.067, 49.459 ], [ 11.177, 49.459 ] ]))
        expect(map.properties[:default_zoom]).to eq 12
      end

      it 'sets default zoom to 10' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 11.067, 49.459 ], [ 11.177, 49.359 ] ]))
        expect(map.properties[:default_zoom]).to eq 10
      end

      it 'sets default zoom to 9' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 10.067, 49.459 ], [ 11.377, 49.259 ] ]))
        expect(map.properties[:default_zoom]).to eq 9
      end

      it 'sets default zoom to 8' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 10.067, 49.459 ], [ 11.477, 49.159 ] ]))
        expect(map.properties[:default_zoom]).to eq 8
      end

      it 'sets default zoom to 6' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 7.067, 49.459 ], [ 11.477, 49.159 ] ]))
        expect(map.properties[:default_zoom]).to eq 6
      end

      it 'sets default zoom to 4' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 7.067, 40.459 ], [ 11.477, 49.159 ] ]))
        expect(map.properties[:default_zoom]).to eq 4
      end

      it 'sets default zoom to 2' do
        map.features << create(:feature, :line_string, coordinates: ([ [ 1.067, 49.459 ], [ 31.177, 49.459 ] ]))
        expect(map.properties[:default_zoom]).to eq 2
      end
    end
  end
end
