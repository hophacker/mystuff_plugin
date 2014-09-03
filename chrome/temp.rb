require File.expand_path('../boot', __FILE__)
  .
module SampleApp
  class Application < Rails::Application
    .
    .
    .
  config.assets.precompile += %w(*.png *.jpg *.jpeg *.gif)
  end
end
