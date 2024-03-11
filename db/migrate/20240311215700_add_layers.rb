class AddLayers < Mongoid::Migration
  def self.up
    Map.all.each { |m| m.layer = Layer.create! unless m.layer }
  end

  def self.down
  end
end
