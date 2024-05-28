import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import Validation from "../utils/Validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Authentication from "../middlewares/Authentication.js";

const router = Router();
const prisma = new PrismaClient();

// POST User Registration API Endpoint
router.post("/register", async (req, res) => {
  //Validate the request body
  const result = Validation.UserRegistration(req.body);
  //Check if the request body is valid
  if (!result.success) {
    return res
      .status(400)
      .send(result.error.errors?.map((error) => error.message));
  }
  try {
    //Check weather the email or phone number already exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: req.body.email }, { phone: BigInt(req.body.phone) }],
      },
    });
    if (user) {
      return res.status(400).json({
        message: "Email or phone number already exists",
      });
    }
    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new User
    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: BigInt(req.body.phone),
      },
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});
// POST User Login API Endpoint
router.post("/login", async (req, res) => {
  //Validate the request body
  const result = Validation.UserLogin(req.body);
  //Check if the request body is valid
  if (!result.success) {
    return res
      .status(400)
      .send(result.error.errors?.map((error) => error.message));
  }
  try {
    //Check if the User exists
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    //Check if the password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.header("Authentication", `Bearer ${token}`);

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

// POST User Logout API Endpoint
router.post("/logout", Authentication, async (req, res) => {
  try {
    res.header("Authentication", "");
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

// GET User Profile API Endpoint
router.get("/profile", Authentication, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: {
          select: {
            street: true,
            city: true,
            state: true,
            zip: true,
            country: true,
          },
        },
      },
    });

    user = {
      ...user,
      phone: user.phone.toString(),
    };

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

//UPDATE User Profile API Endpoint
router.put("/profile", Authentication, async (req, res) => {
  const result = Validation.UserProfile(req.body);
  if (!result.success) {
    return res
      .status(400)
      .send(result.error.errors?.map((error) => error.message));
  }
  try {
    await prisma.userAddress.create({
      data: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country,
        User: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

//GET Refresh Token API Endpoint
router.get("/refresh-token", Authentication, async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);
    res.header("Authentication", `Bearer ${token}`);
    return res.status(200).json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

export default router;