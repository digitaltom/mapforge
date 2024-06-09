Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  scope "/m" do
    get "", to: "maps#index", as: "maps"
    get "/", to: "maps#index"
    get "/:id" => "maps#show", as: :map
    post "" => "maps#create", as: :create_map
    get "/:id/features" => "maps#features", as: :map_features
    get "/:id/properties" => "maps#properties", as: :map_properties
  end
  get "/d/:id" => "maps#show", defaults: { engine: "deck" }, as: :deck

  # some maplibre style tries to load eg. /atm_11; catching those calls here
  get "/atm_11" => "maps#catchall", as: :catchall
  get "/m/atm_11" => "maps#catchall"

  get "/admin" => "admin#index"
  delete "/admin/:id" => "admin#destroy", as: :destroy_map

  get "/frontpage" => "frontpage#index"
  get "/icon/:public_id", to: "images#icon", as: "icon", constraints: { public_id: /[^\/]+/ }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "frontpage#index"
end
