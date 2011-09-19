require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'sinatra/synchrony'

get '/' do
  erb :index
end

get %r{/s/(.+)} do
  erb :slide
end

get %r{/(.+)} do
  erb :index
end