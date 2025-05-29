const express = require("express");

const router = express.Router();

const db = require("../data/database");

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectId;

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const postdata = await db
    .getdb()
    .collection("post")
    .find({}, { title: 1, summary: 1, "author.name": 1 })
    .toArray();
  res.render("posts-list", { post: postdata });
});

router.get("/new-post", async function (req, res) {
  const author = await db.getdb().collection("author").find().toArray();
  res.render("create-post", { author: author });
});

router.post("/posts", async function (req, res) {
  const authorid = new ObjectId(req.body.author);
  const author = await db
    .getdb()
    .collection("author")
    .findOne({ _id: authorid });
  const postdata = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      _id: authorid,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getdb().collection("post").insertOne(postdata);

  res.redirect("posts");
});

router.get("/viewpost/:id", async function (req, res) {
  const postid = req.params.id;
  const result = await db
    .getdb()
    .collection("post")
    .findOne({ _id: new ObjectId(postid) }, { summary: 0 });
  console.log(result);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  result.humanread = result.date.toLocaleDateString("en-US", options);
  result.date = result.date.toISOString();
  res.render("post-detail", { post: result });
});

router.get("/update/:id", async function (req, res) {
  const postid = req.params.id;
  const post = await db
    .getdb()
    .collection("post")
    .findOne({ _id: new ObjectId(postid) });
  res.render("update-post", { post: post });
});

router.post("/posts/:id", async function (req, res) {
  const data = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    postid:req.params.id
  };
  await db.getdb()
    .collection("post")
    .updateOne(
      { _id: new ObjectId(data.postid) },
      { $set: { title: data.title, summary: data.summary, content: data.content ,date:new Date()} }
    );
  res.redirect("/posts");
});

router.post('/delete/:id',async function(req,res){
  await db.getdb().collection('post').deleteOne({_id:new ObjectId(req.params.id)})
  res.redirect("/posts");
})

module.exports = router;
