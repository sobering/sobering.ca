module Sobering
  class Site < Sinatra::Base
    get '/' do
      'Hello world!'
    end
  end
end
