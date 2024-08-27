class HealthController < Rails::HealthController
  def show
    Map.count
    super # Call the original health check
  end
end
