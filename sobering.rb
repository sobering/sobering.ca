module Sobering
  class Site < Sinatra::Base
    set :assets_css_compressor, :sass
    set :assets_js_compressor,  :uglifier

    register Sinatra::AssetPipeline

    get '/' do
      slim :index
    end
  end
end
