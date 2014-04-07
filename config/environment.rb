require 'bundler/setup'
require 'sinatra/base'
require 'sinatra/asset_pipeline'
require 'slim'

ENV['RACK_ENV'] ||= 'development'

Bundler.require :default, ENV['RACK_ENV']
