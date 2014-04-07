require 'logger'

$stdout.sync = true

require File.expand_path('config/environment.rb')
require File.expand_path('sobering.rb')

run Sobering::Site
