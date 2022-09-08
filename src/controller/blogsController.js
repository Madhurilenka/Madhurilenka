const authorModel = require("../Model/authorModel");
const blogModel = require("../Model/blogsModel");
const mongoose = require('mongoose');




//<=================Validators ================================>>//
const verify = function (Id) {
  if (!mongoose.Types.ObjectId.isValid(Id)) {
    return false
  }
  return (true)
}

const isValid = function (value) {
  if (typeof value == undefined || value == null) return false
  if (typeof value == "string" && value.trim().length == 0) return false
  else if (typeof value == "string") return true
}


//========================CREATE BLOGS ===================================

const createBlog = async (req, res) => {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Data is required for Blog Creation" });
    }
    if (!data.title)
      return res.status(400).send({ status: false, msg: "Please Enter Book Title" });
    if (!data.body)
      return res.status(400).send({ status: false, msg: "Please Enter the Book Description" });
    if (!data.authorId)
      return res.status(400).send({ status: false, msg: "Author ID is Mandatory" });

    if (data.authorId) {
      if (!verify(data.authorId)) {
        return res.status(404).send({ status: false, msg: "Please Enter Valid Author Id " })
      } else {
        req.body.authorId = data.authorId
      }
    }

    if (!data.category)
      return res.status(400).send({ status: false, msg: "Please Enter book Category" });

    let getAuthorData = await authorModel.findById(data.authorId);

    if (!getAuthorData)
      return res.status(404).send({ status: false, msg: "No such author found" });

    let getBlogData = await blogModel.create(data);

    res.status(201).send({ status: true, data: getBlogData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

//==================================  Get Blogs  by Blogs Id =========================================

const getBlogs = async (req, res) => {
  try {
    let authorId = req.query.authorId
    let category = req.query.category
    let tags = req.query.tags
    let subcategory = req.query.subcategory

    let filter = { isDeleted: false, isPublished: true }


    if (authorId) { filter.authorId = authorId }
    if (category) { filter.category = category }
    if (tags) { filter.tags = tags }
    if (subcategory) { filter.subcategory = subcategory }



    let savedData = await blogModel.find(filter)
    if (savedData.length == 0) {
      return res.status(400).send({ status: false, msg: "Such Blogs Not Available" })
    } else {
      return res.status(200).send({ status: true, data: savedData })
    }
  } catch (err) {
    res.status(500).send({ msg: err.message })
  }
}


//===================================  PUT UPDATE BLOGs ======================================
const updateBlogs = async (req, res) => {
  try {
    let alldata = req.body
    let getId = req.params.blogId

    if (Object.keys(alldata).length == 0)
      return res.status(400).send({ status: false, msg: "Please Enter Blog Details For Updating" })

    if (!getId)
      return res.status(400).send({ status: false, msg: "Blog Id is required" })

    let findBlogId = await blogModel.findById(getId)

    if (findBlogId.isDeleted == true) res.status(404).send({ msg: "blogs already deleted" })

    let updatedBlog = await blogModel.findOneAndUpdate({ _id: getId }, {
      $set: {
        title: alldata.title,
        body: alldata.body,
        category: alldata.category,
        publishedAt: new Date(),
        isPublished: true
      },
      $push: { tags: req.body.tags, subcategory: req.body.subcategory }
    }, { new: true, upsert: true })
    return res.status(200).send({ status: true, msg: updatedBlog })
  }
  catch (err) {
    res.status(500).send({ status: false, msg: err.message })
  }
};





//================================ Delete Blog by Params =====================================

const deleteByParams = async function (req, res) {
  try {
    let id = req.params.blogId;
    const allBlogs = await blogModel.findOne({ _id: id, isDeleted: false });
    if (!allBlogs) {
      return res.status(404).send({ status: false, msg: "This blog is not found or deleted." });
    }
    let date = new Date();
    allBlogs.isDeleted = true;
    const updated = await blogModel.findByIdAndUpdate({ _id: id }, allBlogs, { new: true, deletedAt: date });
    res.status(200).send({ status: true, msg: "Successfully Blog Deleted" });

  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};



//================================ Delete Blog By Query Params =========================================


const deleteByQueryParams = async function (req, res) {
  try {
    let { category, authorId, tags, subcategory } = req.query
    let filter = { isPublished: false, isDeleted: false }
    if (category) {
      if (!isValid(category)) {
        return res.status(400).send({ status: false, msg: "Enter valid category" })
      }
      filter.category = category
    }
    if (authorId) {
      if (!isValid(authorId)) {
        return res.status(400).send({ status: false, msg: "Enter valid authorId" })
      }
      if (authorId !== req.token.authorId) {
        return res.status(403).send({ status: false, msg: "You are not authorised to perform this task" })
      }
      filter.authorId = authorId
    }
    if (tags) {
      if (tags.trim().length == 0) {
        return res.status(400).send({ status: false, msg: "Enter valid tags" })
      }
      tags = tags.split(",")
      filter.tags = { $in: tags }
    }
    if (subcategory) {
      if (subcategory.trim().length == 0) {
        return res.status(400).send({ status: false, msg: "Enter valid subcategory" })
      }
      subcategory = subcategory.split(",")
      filter.subcategory = { $in: subcategory }
    }
    const data = await blogModel.updateMany(filter, { $set: { isDeleted: true, deletedAt: Date.now() } })
    if (data.modifiedCount == 0) {
      return res.status(404).send({ status: false, msg: "Such Blog Data not found" })
    }
    return res.status(200).send({ status: true, msg: "Blog Deleted Successfully" })
  }
  catch (err) {
    console.log(err)
    return res.status(500).send({ msg: err.message })
  }
}



//============================= Exports Module functions  ==========================//

module.exports.createBlog = createBlog;
module.exports.updateBlogs = updateBlogs;
module.exports.getBlogs = getBlogs;
module.exports.deleteByParams = deleteByParams;
module.exports.deleteByQueryParams = deleteByQueryParams;

