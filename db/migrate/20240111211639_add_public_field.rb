class AddPublicField < Mongoid::Migration
  def self.up
    Map.each { |m| m.update(public: true) }
  end

  def self.down; end
end
