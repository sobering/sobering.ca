require 'spec_helper'

feature 'index' do

  scenario 'user visits the index page' do
    get '/'
    expect(last_response).to be_ok
  end

end
