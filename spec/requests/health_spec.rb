require 'rails_helper'

describe HealthController do
  describe '#show' do
    before { get "/up" }
    subject { response }

    it 'returns success' do
      expect(subject).to have_http_status(200)
    end
  end
end
