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

  describe '#public_id_must_be_unique_or_nil' do
    context 'when map with same public_id already exists' do
      before { create(:map, public_id: 'frontpage') }

      it 'raises error' do
        expect { create(:map, public_id: 'frontpage') }
          .to raise_error(Mongoid::Errors::Validations, /has already been taken/)
      end
    end
  end
end
