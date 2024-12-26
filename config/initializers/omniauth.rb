Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer if Rails.env.development?
  provider :github,
            ENV["GITHUB_CLIENT_ID"],
            ENV["GITHUB_CLIENT_SECRET"],
            scope: "user:email"
end

OmniAuth.config.logger = Rails.logger
