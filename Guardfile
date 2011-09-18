guard 'sass', :input => 'sass', :output => 'css'

guard 'coffeescript', :input => 'public/coffee', :output => 'public/js'

guard 'livereload' do
  watch(%r{views/.+\.(erb|haml)})
  watch(%r{(public/css/.+\.css)\.s[ac]ss}) { |m| m[1] }
  watch(%r{(public/js/.+\.js)\.coffee}) { |m| m[1] }
end