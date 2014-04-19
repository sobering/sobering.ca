source 'https://rubygems.org'
ruby '2.1.0'

gem 'activesupport'
gem 'sinatra'

group :production do
  gem 'unicorn'
end

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
  gem 'shotgun'
end

group :development, :test do
  gem 'capybara'
  gem 'fuubar'
  gem 'guard-rspec'
  gem 'rspec-given'
end
