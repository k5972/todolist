//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://kyranicolearona:NlNSfVh323l4x9ta@cluster0.ncdjuqi.mongodb.net/todolistDB";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

//Routes go here

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Pick Apples"
});


const item2 = new Item({
  name: "Wash Apples"
});


const item3 = new Item({
  name: "Peel Apples"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({})
  .then(function (items) {

    if (items.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  

  if (listName === "Today") {
    item.save();
      res.redirect("/");

  } else {
    List.findOne({name: listName})
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  // }
});

app.get("/:listName", function(req,res){
  const ListName = _.capitalize(req.params.listName);
  
  console.log(ListName);

  List.findOne({name: ListName})
    .then(function (foundList) {
      console.log(foundList);
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: ListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + ListName);
      } else {
        // Show a new list
        // console.log("Exists");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", function(req, res){
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkboxId)
    .then(function () {
      console.log("Success!");      
    });
    res.redirect("/");
  } else {
    console.log("Something");
    List.findOneAndUpdate(
      {name: listName}, 
      {$pull: {items: {_id: checkboxId}}}
      ).then(function (foundList) {
        console.log(foundList);
          console.log(listName);
          res.redirect("/" + listName);
      });
  }
  
  

})

//Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})