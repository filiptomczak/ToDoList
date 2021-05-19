const itemsSchema = new mongoose.Schema({
  name:String
});
const Item=new mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"tap '+' to add item"
});
const item2=new Item({
  name:"<-- click to remove"
});
const defaultItems=[item1,item2];
