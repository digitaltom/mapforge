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
end
