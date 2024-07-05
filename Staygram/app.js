if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/MajorPro";
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// paths........
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const sessionOptions = {
  secret : "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expire:Date.now() + 1000*60*60*24*3,
    maxAge:1000*60*60*24*3,
    httpOnly : true
  }
};

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username : "delta-student"
//   });
//   let registeredUser = await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })

app.use("/listings",listings);

// Including the review routes
app.use("/listings", reviews);

app.use("/",userRouter)

app.all("*", (req,res,next)=>{
  next(new ExpressError(404,"page Not found"));
});

app.use((err,req,res,next)=>{
  let {statusCode=500, message="something went wrong"} = err;
  res.status(statusCode).render("error.ejs", {message});
})

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
