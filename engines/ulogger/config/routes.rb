Rails.application.routes.draw do
   post "/ulogger/client/index.php", to: "api/ulogger#auth",
     constraints: lambda { |request| request.request_parameters["action"] == "auth" }
   post "/ulogger/client/index.php", to: "api/ulogger#addtrack",
     constraints: lambda { |request| request.request_parameters["action"] == "addtrack" }
   post "/ulogger/client/index.php", to: "api/ulogger#addpos",
     constraints: lambda { |request| request.request_parameters["action"] == "addpos" }
end
