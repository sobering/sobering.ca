lock '3.2.1'

set :application, 'sobering.ca'
set :repo_url, 'git@github.com:sobering/sobering.ca.git'

set :chruby_ruby, '2.1.2'

set :deploy_to, "/srv/www/#{fetch(:application)}"
set :unicorn_conf, "#{current_path}/config/unicorn.rb"
set :unicorn_pid, "#{current_path}/tmp/pids/unicorn.pid"

set :linked_dirs, %w(log tmp/pids)

namespace :deploy do
  task :restart do
    on roles(:app) do
      execute "cd #{current_path} && RACK_ENV=#{fetch(:rack_env)} bundle exec rake assets:precompile"
      execute "if [ -f #{fetch(:unicorn_pid)} ]; then kill -USR2 `cat #{fetch(:unicorn_pid)}`; else cd #{current_path} && bundle exec unicorn -c #{fetch(:unicorn_conf)} -E #{fetch(:rack_env)} -D; fi"
    end
  end

  task :start do
    on roles(:app) do
      execute "cd #{current_path} && bundle exec unicorn -c #{fetch(:unicorn_conf)} -E #{fetch(:rack_env)} -D"
    end
  end

  task :stop do
    on roles(:app) do
      execute "if [ -f #{fetch(:unicorn_pid)} ]; then kill -QUIT `cat #{fetch(:unicorn_pid)}`; fi"
    end
  end

  after :publishing, :restart
end
