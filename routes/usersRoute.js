import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { User } from '../models/userModel.js';
import { generateToken } from '../helpers/jwt.js';


const router = express.Router();

const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
  };
  
  const storage = multer.diskStorage({
    destination: function (require, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error("invalid image type");
  
      if (isValid) {
        uploadError = null;
      }
      cb(uploadError, "public/uploads");
    },
    filename: function (require, file, cb) {
      const fileName = file.originalname.split(" ").join("-");
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
  });

  const uploadOptions = multer({ storage: storage });


router.post("/logout", (require, response) => {
    response.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    response.status(200).json({
        success: true,
        message: "Logged out",
    });
});


// new code with integration of jwt toke june 2, 2024
router.post("/login", async (require, response) => {
  try {
    const user = await User.findOne({ email: require.body.email });

    if (!user) {
      return response.status(400).send("The user not found");
    }

    if (user && bcrypt.compareSync(require.body.password, user.password)) {
      // Generate JWT token upon successful login
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      response.status(200).send({ user: user.email, token: token });
    } else {
      response.status(400).send("password is wrong!");
    }
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

//old codes June 2, 2024
  // router.post("/login", async (require, response) => {
  //   const user = await User.findOne({ email: require.body.email });
  
  //   const secret = process.env.SECRET_KEY;
  //   if (!user) {
  //     return response.status(400).send("The user not found");
  //   }
  
  //   if (user && bcrypt.compareSync(require.body.password, user.password)) {
  //     const token = jwt.sign(
  //       {
  //         userId: user.id,
  //         email: user.email,
  //         role: user.role,
  //       },
  
  //       secret,
  //       { expiresIn: "1d" }
  //     );
  
  //     response.status(200).send({ user: user.email, token: token });
  //   } else {
  //     response.status(400).send("password is wrong!");
  //   }
  // });

  router.post("/", uploadOptions.single('image'), async (req, res) => {
    try {
      const { name, mobileNumber, companyId, email, password } = req.body;
  
      if (!name || !mobileNumber || !companyId || !email || !password) {
        return res.status(400).send({
          message: "Send all required fields: name, mobileNumber, companyId, email, password",
        });
      }
  
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      const existingPhone = await User.findOne({ mobileNumber });
      if (existingPhone) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
  
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
      let avatar;
      if (!req.file) {
        const defaultImageUrl = "https://res.cloudinary.com/dn638duad/image/upload/v1714804250/User%20Profile/default_image_odca9a.png";
        avatar = { url: defaultImageUrl };
      } else {
        const cloudinaryFolderOption = { folder: "User Profile", crop: "scale" };
        const result = await cloudinary.v2.uploader.upload(req.file.path, cloudinaryFolderOption);
        avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
  
      const newUser = new User({
        name,
        mobileNumber,
        companyId,
        email,
        password: hashedPassword,
        avatar,
        role: "employee",  
      });
  
      const user = await newUser.save();
      return res.status(201).send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ message: error.message });
    }
  });
  

export default router;
