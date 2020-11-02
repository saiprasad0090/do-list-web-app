const express=require("express");
const mongoose=require("mongoose");
const bodyparser=require("body-parser");
const _ =require("lodash");
const app=express();
// let items = ["Buy Food","Eat Food"];
// let works=[];
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-preethi:saipreethi829@cluster0-1q8y9.mongodb.net/todolistDB', {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify:false});

const ItemsSchema=new mongoose.Schema({
    name:String
});

const Item=new mongoose.model("Item",ItemsSchema);

// const WorkSchema=new mongoose.Schema({
//     name:String
// });

// const work=new mongoose.model("work",WorkSchema);


const item1=new Item({
    name:"Welcome to Our dolist app"
});

const item2=new Item({
    name:"Add new Item and hit Enter"
});

const item3=new Item({
    name:"<--- hit this to delete item"
});

// const work1=new Item({
//     name:"Welcome to Our worklist app"
// });


const defaultItems=[item1,item2,item3];

// const defaultItems1=[work1];
const listSchema={
    name:String,
    items:[ItemsSchema]
}

const List=new mongoose.model("List",listSchema);




app.get("/",function(req,res)
{
 let d=new Date();
 let options={
     weekday:"long",
     day:"numeric",
     month:"long"

 };
 
 let day=d.toLocaleDateString("en-Us",options);

 Item.find({},function(err,foundItems){
     if(foundItems.length==0)
     {
        Item.insertMany(defaultItems,function(err){
            if(err)
            console.log(err);
            else
            console.log("successfull");
        })
     }
    res.render("list",{kindofDay:"today",newItems:foundItems});
 });
});

app.get("/:customListName",function(req,res){
   const customListName=_.capitalize(req.params.customListName);
   List.findOne({name:customListName},function(err,foundlist)
   {
       if(!err)
       {
           if(!foundlist)
           {
           //create new list
           const list=new List({
            name:customListName,
            items:defaultItems
        });
         
   list.save();
   res.redirect("/"+customListName);
           }
           else
           {
               //show an existing list
               res.render("list",{kindofDay:foundlist.name,newItems:foundlist.items});

           }
       }
   })

  

   
});

app.post("/",function(req,res)
 {
     const itemname=req.body.new;

     const listname=req.body.list;

//     if(itemreq=="work list"){
//         const work2=new work({
//             name:itemname
//         });
//         work2.save();
       
//         res.redirect("/work");


//     }  
//    else{
    const item=new Item({
        name:itemname
    });
if(listname==="today"){

    item.save();
   
     res.redirect("/");
}
else{
    List.findOne({name:listname},function(err,foundlist){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listname);
    })
}
    
//    }        
 });


 app.post("/delete",function(req,res){
    const checkedItemId=req.body.check;
    const listname=req.body.listname;
    if(req.body.listname=="today")
    {
    Item.findByIdAndRemove(checkedItemId,function(err){
         if(!err)
         console.log("succesfully deleted");
    });
    res.redirect("/");
}
else
{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
          if(!err)
          {
              res.redirect("/"+listname);
          }
    });
}

});











//  app.get("/work",function(req,res){
//     work.find({},function(err,workItems){
//         if(workItems.length==0)
//         {
//            work.insertOne(defaultItems1,function(err){
//                if(err)
//                console.log(err);
//                else
//                console.log("successfull");
//            })
//         }
    
//     res.render("list",{kindofDay:"work list",newItems:workItems});
    
//  });
// });
//  app.get("/about",function(req,res){
//      res.render("about");
//  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function(){
 console.log("sever is running");
});