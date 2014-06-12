source 'https://rubygems.org'
ruby '2.1.2'

gem 'activesupport'
gem 'sinatra'

group :assets do
  gem 'bootstrap-sass'
  gem 'bourbon'
  gem 'coffee-script'
  gem 'neat'
  gem 'sass'
  gem 'sinatra-asset-pipeline'
  gem 'slim'
  gem 'uglifier'
end

group :development do
  gem 'capistrano', '~> 3.2'
  gem 'capistrano-bundler', '~> 1.1.2'
  gem 'capistrano-chruby', '~> 0.1.1'
  gem 'shotgun'
end

group :development, :test do
  gem 'capybara'
  gem 'fuubar'
  gem 'guard-rspec'
  gem 'rspec-given'
end

group :production do
  gem 'unicorn'
end
