require 'bundler/setup'
require 'sinatra/base'
require 'slim'

ENV['RACK_ENV'] = 'development' unless ENV['RACK_ENV']

Bundler.require :default, ENV['RACK_ENV']
