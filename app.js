require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session=require("express-session");
const passport=require("passport");
var LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose=require("passport-local-mongoose");
const app = express();
const date=require(__dirname+"/date.js");
const items = [];
const itemsWork = [];
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true});

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

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List=new mongoose.model("List",listSchema);

const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  list:[listSchema]
});
userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  if(req.isAuthenticated()){
    var user = req.user.username;
    User.findOne({username:user},function(err,foundUser){
      if(!err){
        if(foundUser){
          console.log(foundUser.list.length)
          if(foundUser.list.length===0){
            defaultItems.forEach(function(item){
              foundUser.list.push(item);
          });
          foundUser.save();
        }
          res.render("list",{titleList: date.getDate(),todoItems:foundUser.list});
        }
      }
    });
  }else{
    res.redirect("/welcome");
  }
});

app.get("/welcome", function(req,res){
  res.render("welcome");
})
app.post("/log", function(req,res){
  res.redirect("/login");
})
app.post("/reg", function(req,res){
  res.redirect("/register");
})
/*app.get("/:page",function(req,res){
  /*if(req.isAuthenticated()){

    var user = req.user.username;
    User.findOne({username:user},function(err,foundUser){
      if(!err){
        if(foundUser){

          res.render("list",{titleList: "to do",todoItems:foundUser.list});
        }
      }
    });
  }else{
    res.redirect("/login");
  }


  const page=req.params.page;
  List.findOne({name:page},function(err,result){
    if(!err){
      if(result!=null){
        if(result.name===page){
          res.render("list",{titleList: page,todoItems: result.items});
        }
      }else{
        console.log("doesn't exist");
        const list=new List({
          name:page,
          items:defaultItems
        })
        list.save();
        res.redirect("/"+page);
      }
    }
  });
});
*/

app.post("/", function(req, res){
  var user = req.user.username;
  const item = req.body.todoItem;
  const listName = req.body.listButton;
  const newItem=new Item({
    name:item
  });
  User.findOne({username:user},function(err,foundUser){
    foundUser.list.push(newItem);
    foundUser.save();
    res.redirect("/");
  })
});


app.post("/logout",function(req,res){
  req.logout();
  res.redirect("/login");
});


app.post("/delete",function(req,res){
  var user = req.user.username;
  const itemID=req.body.checkbox;
  const listName = req.body.listInput;
  console.log(itemID);
  console.log(listName);
  console.log(user);

  User.findOne({username:user},function(err,foundUser){
    console.log(foundUser.list);
    foundUser.list.id(itemID).remove();
    foundUser.save(function(err){
      if(!err) {
        console.log("item removed successfully");
        res.redirect("/");
      }
    });
  });
  /*User.findOne({username:user},function(err,foundUser){

  }*/
  /*if(listName===date.getDate()){
    Item.findByIdAndRemove(itemID,function(err){
      if(!err){
        console.log("deleted item: "+itemID);
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemID}}},function(err){
      if(!err){
          res.redirect("/"+listName);
      }
    });
  }*/
});

app.route("/register")
  .get(function(req,res){
    res.render("register");
  })
  .post(function(req,res){
      User.register({username:req.body.username},req.body.password,function(err,user){
        if(!err){
          passport.authenticate("local")(req,res,function(){
            res.redirect("/");
            console.log("user registrated successfully");
          })
        }else{
          res.send("blad");
        }
      })
    })

  app.route("/login")
    .get(function(req,res){
      res.render("login");
    })
    .post(function(req,res){
      const user = User({
        username:req.body.username,
        password:req.body.password
      });
      req.login(user,function(err){
        if(!err){
          passport.authenticate("local")(req,res,function(){
            res.redirect("/");
            //passport.authenticate("local",{successRedirect: '/',failureRedirect:'/register'});
        });
      }
    });
  })
app.listen(3000, function(){
  console.log("server started");
});
