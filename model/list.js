const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List=new mongoose.model("List",listSchema);
