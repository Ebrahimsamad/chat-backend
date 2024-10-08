const util = require("util");
const jwt = require("jsonwebtoken");
const jwtSign = util.promisify(jwt.sign);
const User = require("../models/user");
const bcrypt = require("bcrypt");
const CustomError = require("../utils/customError");
const transporter = require("../utils/nodemialer");
const crypto = require("crypto");

exports.signup = async (req, res, next) => {
  const { fullName, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new CustomError("Email is already used.", 409));
    }

    const user = new User({
      fullName,
      email,
      phone,
      password,
      IDImage: req.body.IDImage,
    });
    await user.save();
    const mailOptions = {
      from: `Kiro <${process.env.NODEMAILER_EMAIL}>`,
      to: user.email,
      subject: "verify your email",
      html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .email-container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              background-color: #e0e0e0;
              border-radius: 10px 10px 0 0;
              color: black;

            }
            .header img {
              max-width: 150px;
              margin-bottom: 10px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 0 0 10px 10px;
            }
            .content p {
              margin: 0 0 15px;
              color: black;
            }
            .content strong {
              color: #002b4c;
            }
            
            .content a {
              width: 50%;
              display: block;
              background-color: #B92A3B;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 15px;
              border-radius: 15px;
              font-size: 16px;
              text-align: center;
              cursor: pointer;
              margin-top: 15px;
              margin-bottom: 20px;
            }
            .content a:hover {
              background-color: #003366;
            }
           
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://ik.imagekit.io/7ksxy0uxk/e-commerce/kiro.png?updatedAt=1727299184371">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>To verify your email, please use the following button:</p>
              <a href="https://chat-ebrahim-samad.vercel.app/verify-email?email=${user.email}">verifie your email</a>
            </div>
          </div>
        </body>
        </html>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).send({
      message: "User created successfully and sent verify email successfully",
    });
  } catch (error) {
    next(new CustomError("Internal server error: " + error.message, 500));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new CustomError("Invalid email or password", 401));
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (isMatched) {
      if (!user.isVerified) {
        return next(new CustomError("Your email is not verified", 403));
      }
      const token = await jwtSign(
        { userId: user._id },
        process.env.JWT_SECRET_ACCESS_TOKEN,
        {
          expiresIn: "30d",
        }
      );

      res
        .status(200)
        .send({ message: "User logged in successfully", token, user });
    } else {
      return next(new CustomError("Invalid email or password", 401));
    }
  } catch (error) {
    next(new CustomError("Internal server error:" + error.message, 500));
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    if (!user) {
      return next(new CustomError("User not found.", 404));
    }
    const token = await jwtSign(
      { userId: user._id },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "30d",
      }
    );
    res
      .status(200)
      .send({ message: "User verified successfully", token, user });
  } catch (error) {
    next(new CustomError("Internal server error:" + error.message, 500));
  }
};

exports.forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new CustomError("User not found.", 404));
    }

    const resetToken = crypto.randomBytes(3).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000;
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;

    await user.save();

    const mailOptions = {
      from: `Kiro <${process.env.NODEMAILER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            background-color: #e0e0e0;
            border-radius: 10px 10px 0 0;
            color: black;
          }
          .header img {
            max-width: 150px;
            margin-bottom: 10px;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 0 0 10px 10px;
          }
          .content p {
            margin: 0 0 15px;
            color: #8A690F;
          }
          .content strong {
            color: #002b4c;
          }
          .content input{
            width: 75%;
            text-align: center;
            padding: 10px;
            border: 1px solid #002b4c;
            border-radius: 5px;
            margin-bottom: 20px;
            background-color: #f4f4f4;
            color: #333;
            font-size: 16px;
            cursor: not-allowed;
          }
          .content a {
            width: 50%;
            display: block;
            background-color: #B92A3B;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 16px;
            text-align: center;
            cursor: pointer;
            margin-top: 15px;
            margin-bottom: 20px;
          }
          .content a:hover {
            background-color: #003366;
          }
         
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="https://ik.imagekit.io/7ksxy0uxk/e-commerce/kiro.png?updatedAt=1727299184371" alt="Logo">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>To reset your password, please use the following token:</p>
            <input type="text" value="${resetToken}" readonly>
            <a href="https://menha.vercel.app/reset-password?email=${user.email}&&token=${resetToken}">Reset Token Direct</a>
          </div>
        </div>
      </body>
      </html>
      
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: "Password reset email sent." });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

exports.resetPasswordCheckToken = async (req, res, next) => {
  const { token, email } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return next(new CustomError("rest token wrong or expirat", 400));
    }
    res.status(200).send({ message: "Reset password token successfully" });
  } catch (err) {
    next(new CustomError("Internal server error.", 500));
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, email, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new CustomError("rest token wrong or expirat or User not found.", 400)
      );
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    next(new CustomError("Internal server error.", 500));
  }
};
