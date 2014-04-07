ENV['RACK_ENV'] = 'test'

require 'rspec'
require 'rspec/given'
require 'rack/test'
require 'capybara/rspec'

require './config/environment.rb'
require './sobering.rb'

Dir['./spec/support/**/*.rb'].each { |f| require f }

RSpec.configure do |c|
  c.include Rack::Test::Methods
  c.filter_run focus: true
  c.filter_run_excluding ignore: true
  c.run_all_when_everything_filtered = true
  c.treat_symbols_as_metadata_keys_with_true_values = true

  def app
    Sobering::Site
  end
end
