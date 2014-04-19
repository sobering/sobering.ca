require 'bundler/setup'
require 'sinatra/base'
require 'sinatra/asset_pipeline'
require 'active_support/inflector'
require 'slim'
require 'bootstrap-sass'

ENV['RACK_ENV'] ||= 'development'

Bundler.require :default, ENV['RACK_ENV']
