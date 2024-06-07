require 'stringio'

def capture_stdout
  out = StringIO.new
  err = StringIO.new
  logger = Rails.logger
  $stdout = out
  $stderr = err
  Rails.logger = ActiveSupport::TaggedLogging.new(Logger.new(out))
  yield
  [ out.string, err.string ]
ensure
  $stdout = STDOUT
  $stderr = STDERR
  Rails.logger = logger
end
