require 'rack/cache'

Rails.application.middleware.insert_before(Rack::Runtime, Rack::Cache, {
  metastore:    'file:tmp/cache/rack/meta',
  entitystore: 'file:tmp/cache/rack/body',
  verbose:      true
})
