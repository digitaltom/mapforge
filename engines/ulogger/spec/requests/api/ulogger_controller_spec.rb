require 'rails_helper'

RSpec.describe Api::UloggerController do
  describe '#auth' do
    before { post '/ulogger/client/index.php', params: payload }
    subject { response }
    let(:payload) { { action: 'auth', pass: 'supers3cr3t', user: 'cwh' } }
    let(:response_body) { JSON.parse(response.body) }

    it { is_expected.to have_http_status(200) }
    it { expect(response_body['error']).to eq(false) }
  end

  describe '#addtrack' do
    before { post '/ulogger/client/index.php', params: payload }
    subject { response }
    let(:payload) { { action: 'addtrack', track: 'ulogger track' } }
    let(:response_body) { JSON.parse(response.body) }

    it { is_expected.to have_http_status(200) }
    it { expect(response_body['error']).to eq(false) }

    it 'returns a numeric id' do
      expect(response_body['trackid']).to be > 0
      expect(response_body['trackid']).to be < Api::UloggerController::JAVA_MAXINT
    end

    it 'creates map in db with 24 digits' do
      expect(Map.find("%024d" % [ response_body['trackid'] ])).not_to be_nil
    end

    it 'sets map name' do
      expect(Map.find("%024d" % [ response_body['trackid'] ]).name).to eq 'ulogger track'
    end
  end

  describe '#addpos' do
    before do
      map
      post '/ulogger/client/index.php', params: payload
    end
    subject { response }
    let(:map) { create(:map, id: "%024d" % [ trackid ]) }
    let(:trackid) { 924977797 }
    let(:payload) { { action: 'addpos', altitude: 374.29,
      provider: 'network', trackid: trackid, accuracy: 16.113,
      lon: 11.1268342, time: 1717959606, lat: 49.4492029 } }
    let(:response_body) { JSON.parse(response.body) }

    it { is_expected.to have_http_status(200) }
    it { expect(response_body['error']).to eq(false) }

    it 'adds point feature at coordinates' do
      expect(map.reload.features.count).to eq 1
      expect(map.reload.features.first.geometry['coordinates']).
        to eq ([ "11.1268342", "49.4492029", "374.29" ])
    end
  end
end
