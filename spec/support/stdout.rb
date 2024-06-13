require 'stringio'

def capture_stdout
  original_stdout = $stdout
  original_stderr = $stderr
  original_logger = Rails.logger

  buffers = { stdout: StringIO.new, stderr: StringIO.new }
  $stdout = buffers[:stdout]
  $stderr = buffers[:stderr]
  yield
ensure
  $stdout = original_stdout
  $stderr = original_stderr
  Rails.logger = original_logger
end
