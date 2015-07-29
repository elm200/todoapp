class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  #protect_from_forgery with: :exception
  before_action :validate_http_origin

  private

  def validate_http_origin
    response.headers['Access-Control-Allow-Origin'] = request.headers['HTTP_ORIGIN'] if request.headers['HTTP_ORIGIN']
  end
end
