Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # some maplibre style tries to load eg. /atm_11; catching those calls here
  get "/:map_resource" => "maps#catchall", as: :catchall, constraints: { map_resource: /[a-z]+_11/ }
  get "/m/:map_resource" => "maps#catchall", constraints: { map_resource: /[a-z]+_11/ }

  scope "/m" do
    get "", to: "maps#index", as: "maps"
    get "/", to: "maps#index"
    get "/:id" => "maps#show", as: :map
    post "" => "maps#create", as: :create_map
    get "/:id/features" => "maps#features", as: :map_features
    get "/:id/properties" => "maps#properties", as: :map_properties
  end
  get "/d/:id" => "maps#show", defaults: { engine: "deck" }, as: :deck

  get "/admin" => "admin#index"
  delete "/admin/:id" => "admin#destroy", as: :destroy_map

  get "/frontpage" => "frontpage#index"
  get "/icon/:public_id", to: "images#icon", as: "icon", constraints: { public_id: /[^\/]+/ }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "frontpage#index"

  post "/ulogger/client/index.php", to: "api/ulogger#auth", constraints: lambda {
 |request| request.request_parameters["action"] == "auth" }
  post "/ulogger/client/index.php", to: "api/ulogger#addtrack", constraints: lambda {
 |request| request.request_parameters["action"] == "addtrack" }
  post "/ulogger/client/index.php", to: "api/ulogger#addpos", constraints: lambda {
 |request| request.request_parameters["action"] == "addpos" }
end
