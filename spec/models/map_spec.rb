require 'rails_helper'

describe Map do
  describe '.create_from_file' do
    context 'when map with same name already exists' do
      before { create(:map, public_id: 'frontpage') }

      it 'raises error' do
        expect { Map.create_from_file('db/seeds/frontpage.geojson') }
          .to raise_error(RuntimeError, /Map with public id 'frontpage' already exists/)
      end
    end
  end
end
