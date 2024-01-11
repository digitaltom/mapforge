class AddPublicField < Mongoid::Migration
  def self.up
    Map.find_each { |m| m.update(public: true) }
  end

  def self.down; end
end
