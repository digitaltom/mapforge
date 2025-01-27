class FrontpageController < ApplicationController
  layout "frontpage"

  before_action :disable_session_cookies

  def index
  end
end
