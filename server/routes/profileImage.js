const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
//import profileImage schema
const ProfileImageModel = require("../model/ProfileImage");

//set stroage engine for multer (disk storage in node js to save the files)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/profileImageUpload",
  upload.single("profileImage"),
  (req, res) => {
    let fileName = req.file.filename;

    ProfileImageModel.find({ userName: req.body.userName }, (err, result) => {
      if (err) res.send("ERROR");

      // if profile image already exist
      if (result.length) {
        result[0].img = {
          data: fs.readFileSync("uploads/" + fileName),
          contentType: "image/png",
        };
        result[0]
          .save()
          .then((response) => {
            // fs.unlink("uploads/" + fileName, (err) => {
            //   if (err) {
            //     res.send("Error to update new image...");
            //   }
            // });
            res.send(response);
          })
          .catch((err) => {
            res.send("error to save");
          });
      } 
      // if the image is not exist then we have to upload it first time
      else {
        const saveImage = new ProfileImageModel({
          userName: req.body.userName,
          img: {
            data: fs.readFileSync("uploads/" + fileName),
            contentType: "image/png",
          },
        });

        saveImage
          .save()
          .then((response) => {
            // fs.unlink("uploads/" + fileName, (err) => {
            //   if (err) {
            //     res.send("error to save the new image");
            //   }
            // });
            res.send(response);
          })
          .catch((err) => {
            res.send("error to save");
          });
      }
    });
  }
);

// router.get("/getImage", async (req, res) => {
//   let recipeImageId = req.query.recipeImageId;
//   if(recipeImageId) {
//     let result = await ImageModel.find({
//       _id: recipeImageId,
//     });

//     try{
//       res.send(result);
//     } catch(e) {
//       res.send(e);
//     }
//   } else {
//     res.send('EMPTY');
//   }
// });

// router.get("/profileImage", async (req, res) => {
//   let userName = req.query.userName;
//   ProfileImageModel.find(
//     {
//       userName: userName,
//     },
//     (err, result) => {
//       if (err) res.send("ERROR");
//       res.send(result);
//     }
//   );
// });

// router.put("/profileImageUserNameUpdate", async (req, res) => {
//   let userName = req.body.userName;
//   let newUserName = req.body.newUserName;

//   try {
//     let profileImageData = await ProfileImageModel.find({
//       userName: userName,
//     });
//     if (profileImageData.length) {
//       profileImageData[0].userName = newUserName;
//       profileImageData[0].save();
//     }
//     res.send(profileImageData);
//   } catch (err) {
//     console.log(err);
//   }
// });

module.exports = router;
