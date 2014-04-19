module Sobering
  class Site < Sinatra::Base
    set :assets_css_compressor, :sass
    set :assets_js_compressor,  :uglifier

    register Sinatra::AssetPipeline

    get '/' do
      redirect '/resume'
    end

    get '/resume' do
      data   = File.read('public/resume.json')
      resume = JSON.parse(data)

      slim :resume, locals: { resume: resume }
    end
  end
end
