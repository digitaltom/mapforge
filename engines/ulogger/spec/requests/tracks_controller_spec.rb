require 'rails_helper'

RSpec.describe TracksController do
  describe '#redirect' do
    context 'redirect with id param' do
      before { get "/ulogger/?id=#{id}" }
      subject { response }
      let(:id) { '1234' }

      it 'returns 404 on invalid id' do
        get "/ulogger/?id=1234"
        expect(subject).to have_http_status(404)
      end

      it 'redirects to public map url' do
        Map.create(id: "000000000000000000001234")
        get "/ulogger/?id=1234"
        expect(subject).to have_http_status(302)
      end
    end
  end
end
