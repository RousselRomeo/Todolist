const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
const mongoose = require("mongoose")
const app = express();
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
app.set('view engine', 'ejs');


const itemsSchema = {

  name: String
};

const listSchema = {

  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "welcome to your todolist!"
})

const item2 = new Item({
  name: "hit + to aff a new item "
})

const item3 = new Item({
  name: "<-- hit this to delete an item"
})

const defaultitems = [item1, item2, item3];


app.get("/",function(req,res) {

 Item.find({}, function(err,foundItems){

  if(foundItems.length==0) {
    Item.insertMany(defaultItems,function(err){

      if(err){
        console.log(err);
      } else {
        console.log("sucessfully saved default items to DB");
         }
    });
    res.redirect("/")
  } else {
    res.render("list", {listTitle: "Today",newListItems: foundItems});
  }
});

});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list

const item = new Item({
name:itemName
});

  if(listName=="Today"){
    item.save()
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName );
    });
  }
});


app.post("/delete",function(req,res){

  const checkedItem=req.body.checkbox;
  const listName=req.body.listName;

  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err){
        console.log("sucessfully delleted item");
        res.redirect("/")
      }
    })
  }else{

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });

  }

});

app.get("/:customListName",function(req,res){

const customListName = _.capitalize(req.params.customListName);



List.findOne({name:customListName},function(err,foundList){
if(!err){
  if(!foundList){
  //creat a newlist
  const list = new List({

    name:customListName,
    items:defaultitems
  });
  list.save();
  res.redirect("/"+customListName)
  }else{
  //show existing list
    res.render("list", {listTitle:foundList.name,newListItems: foundList.items});
  }
}
})

})



app.get("/work", function(req, res) {

  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {

  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
