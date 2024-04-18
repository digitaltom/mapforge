Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  resources :maps do
    member do
      get :features
      get :properties
    end
  end

  get "/frontpage" => "frontpage#index"
  get "/deck" => "frontpage#deck"
  get "/m" => "frontpage#maplibre"

  get "/icon/:public_id", to: "images#icon", as: "icon", constraints: { public_id: /[^\/]+/ }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "frontpage#index"
end
