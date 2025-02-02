Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  ID_PATTERN = /[^\/]+/ # all characters but '/'

  # login routes
  get "auth/:provider/callback", to: "sessions#create"
  get "auth/developer/login", to: "sessions#new"
  post "auth/developer/login", to: "sessions#developer" if Rails.env.local?
  get "/login", to: "sessions#new"
  get "/logout", to: "sessions#logout"

  # some maplibre style tries to load eg. /atm_11; catching those calls here
  get "/:map_resource" => "maps#catchall", as: :catchall, constraints: { map_resource: /[a-z]+_11/ }
  get "/m/:map_resource" => "maps#catchall", constraints: { map_resource: /[a-z]+_11/ }

  scope "/m" do
    get "", to: "maps#index", as: "maps"
    get "/", to: "maps#index"

    # map exports
    get "/:id.json" => "maps#show", constraints: { id: ID_PATTERN }, defaults: { format: "json" }
    get "/:id.geojson" => "maps#show", constraints: { id: ID_PATTERN }, defaults: { format: "geojson" }
    get "/:id.gpx" => "maps#show", constraints: { id: ID_PATTERN }, defaults: { format: "gpx" }
    get "/:id/properties" => "maps#properties", as: :map_properties, constraints: { id: ID_PATTERN }
    get "/:id" => "maps#show", as: :map, constraints: { id: ID_PATTERN }

    post "" => "maps#create", as: :create_map
    delete "/:id" => "maps#destroy", as: :destroy_map, constraints: { id: ID_PATTERN }
  end
  get "/my" => "maps#my", as: "my"

  get "/d/:id" => "maps#show", defaults: { engine: "deck" }, as: :deck, constraints: { id: ID_PATTERN }

  get "/admin" => "admin#index"

  # map icons
  get "/icon/:public_id", to: "images#icon", as: "icon", constraints: { public_id: ID_PATTERN }
  get "/image/:public_id", to: "images#image", as: "image", constraints: { public_id: ID_PATTERN }
  post "/images", to: "images#upload", as: "upload"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "frontpage#index"
  get "/frontpage" => "frontpage#index"

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  mount Ulogger::Engine, at: "/ulogger"
end
