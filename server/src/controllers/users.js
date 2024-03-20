const {
  validateEmail,
  validateLength,
  validateUsername,
  messageValidation,
  userUpdateValidation,
  validateName,
} = require("../helpers/validation");

const User = require("../models/user");
const Mail = require("../models/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Code = require("../models/code");
const generateCode = require("../helpers/generateCode");
const { generateToken } = require("../helpers/tokens");
const {
  sendVerificationEmail,
  sendResetCode,
  sendAdminEmail,
} = require("../helpers/mailer");
const { path } = require("express/lib/application");
const sendEmail = require("../helpers/sendEmail");

// exports.test = async (req, res) => {
//   try {
//     const add = await DiligenceUser.updateMany(
//       {},
//       { $set: { resetToken: "" } }
//     );
//     console.log(add);
//     return res.status(200).json({ message: "success" });
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      password,
      email,
      phone,
      referral_code,
    } = req.body;

    if (!validateName(first_name)) {
      return res.status(400).json({
        message: "Invalid first name provided.",
      });
    }

    if (!validateName(last_name)) {
      return res.status(400).json({
        message: "Invalid last name provided.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address provided.",
      });
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({
        message:
          "The email address is already in use. Login or register with a new address.",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "Your first name must be between 3 and 30 characters.",
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "Your last name must be between 3 and 30 characters.",
      });
    }

    if (!validateLength(password, 6, 30)) {
      return res.status(400).json({
        message: "Your password must be at least 6 characters.",
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);
    let formattedEmail = email.toLowerCase();

    const user = await new User({
      first_name,
      last_name,
      username: newUsername,
      password: cryptedPassword,
      email: formattedEmail,
      phone,
      referral_code,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString(), email: email },
      "30m"
    );

    const usertoken = generateToken({ id: user._id.toString() }, "10000d");
    const createToken = await User.findByIdAndUpdate(user._id, {
      user_token: usertoken,
    });

    await createToken.save();

    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    //user email
    // const subject = "Welcome to Sidebrief.";
    // payload = {
    //   name: user.first_name,
    // };
    // const senderEmail = '"Sidebrief" <hey@sidebrief.com>';
    // const recipientEmail = user.email;
    // sendEmail(
    //   subject,
    //   payload,
    //   recipientEmail,
    //   senderEmail,
    //   "../view/welcome.ejs"
    // );

    sendAdminEmail(user.email, user.first_name, user.phone);

    //admin email
    // const adminEmail = "sales@sidebrief.com, compliance@sidebrief.com";
    // const subject2 = "A new user has signed up.";
    // payload = {
    //   name: user.first_name,
    //   email: user.email,
    //   phone: user.phone,
    // };

    // sendEmail(subject2, payload, adminEmail, senderEmail, "../view/admin.ejs");

    const accessToken = generateToken({ id: user._id.toString() }, "30m");
    const refreshToken = generateToken({ id: user._id.toString() }, "2h");

    const currentTime = Date.now();
    const expirationTime = currentTime + 30 * 60 * 1000;

    res.send({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.picture,
      token: accessToken,
      tokenExpiresIn: expirationTime,
      refreshToken: refreshToken,
      verified: user.verified,
      user_token: usertoken,
      referral_code: user.referral_code,
      message:
        "Registered successfully. We have sent a confirmation to your email address.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const validUser = req.user.id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);

    if (validUser !== user.id) {
      return res
        .status(400)
        .json({ message: "Please login to your own account to verify it." });
    }

    if (check.verified === true) {
      return res
        .status(400)
        .json({ message: "This account is already verified." });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res.status(200).json({ message: "Your account is now verified." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();
    const user = await User.findOne({ email })
      .populate("draft_launch_requests", "-_id -__v")
      .populate("submitted_launch_requests", "-_id -__v");
    if (!user) {
      return res.status(400).json({
        message: "The email address is not registered to an account.",
      });
    }

    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "The password is incorrect. Please try again.",
      });
    }

    const accessToken = generateToken({ id: user._id.toString() }, "30m");
    const refreshToken = generateToken({ id: user._id.toString() }, "2h");

    const currentTime = Date.now();
    const expirationTime = currentTime + 30 * 60 * 1000;

    res.send({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.picture,
      token: accessToken,
      tokenExpiresIn: expirationTime,
      refreshToken: refreshToken,
      verified: user.verified,
      draft_launch_requests: user.draft_launch_requests,
      submitted_launch_requests: user.submitted_launch_requests,
      message: "Login successful.",
      has_used_referral_code: user.has_used_referral_code,
      isPartner: user.isPartner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDraftLaunchRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to continue.",
      });
    }
    const user = await User.findById(req.user.id).populate(
      "draft_launch_requests",
      "-_id -__v"
    );

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.send(user.draft_launch_requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserSubmittedLaunchRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to continue.",
      });
    }

    const user = await User.findById(req.user.id).populate(
      "submitted_launch_requests",
      "-_id -__v"
    );

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.send(user.submitted_launch_requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRewards = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to continue.",
      });
    }

    const user = await User.findById(req.user.id).populate(
      "claimed_rewards",
      "-_id -__v"
    );

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.send(user.claimed_rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({
        message: "Cannot find your account, please try again.",
      });
    }

    if (user.verified === true) {
      return res
        .status(400)
        .json({ message: "This account is already activated." });
    }

    const emailVerificationToken = generateToken(
      { id: user._id.toString(), email: user.email },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;

    sendVerificationEmail(user.email, user.first_name, url);

    return res.status(200).json({ message: "Verification email sent again." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "Account does not exists.",
      });
    }
    return res.status(200).json({
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "That email is not registered to an account.",
      });
    }
    if (user) {
      await Code.findOneAndRemove({ user: user._id });
      const code = generateCode(5);
      const savedCode = await new Code({
        code,
        user: user._id,
      }).save();
      sendResetCode(user.email, user.first_name, code);
      return res.status(200).json({
        message: "Email reset code has been sent to your email",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Please enter your email and password code.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "That email is not registered to an account.",
      });
    }

    const Dbcode = await Code.findOne({ user: user._id });

    if (!Dbcode) {
      return res.status(400).json({
        message: "Please request for a new code.",
      });
    }

    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong..",
      });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Please enter your email",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Please enter your password",
    });
  }

  const cryptedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      password: cryptedPassword,
    }
  );
  return res.status(200).json({ message: "ok" });
};

exports.updateUser = async (req, res) => {
  try {
    let { first_name, last_name, phone, picture, useReferralCode } = req.body;

    let email = req.params.email;

    console.log("ddfsdf", email);
    const { error } = userUpdateValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email",
      });
    }
    email = email.toLowerCase();

    const checkEmail = await User.findOne({ email });
    if (!checkEmail) {
      return res
        .status(400)
        .json({ error: "The email address is not registered to an account." });
    }

    const updateUser = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          first_name: first_name,
          last_name: last_name,
          phone: phone,
          picture: picture,
          has_used_referral_code: useReferralCode,
        },
      }
    );

    if (!updateUser) {
      return res
        .status(400)
        .json({ error: "Error occurred while updating the user record." });
    }
    return res.status(200).json({
      message: "User record updated successfully",
      data: {
        id: updateUser._id,
        username: updateUser.username,
        first_name: updateUser.first_name,
        last_name: updateUser.last_name,
        picture: updateUser.picture,
        verified: updateUser.verified,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error occured" });
  }
};

//udpate promo code user
//take the promo code
//check if it exists
//push the user email to the promocode owner
exports.UpdatePromo = async (req, res) => {
  try {
    const { promoCode, email, useReferralCode } = req.body;

    const checkUser = await User.findOne({ email: email });

    if (!checkUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const updateUserPromoStatus = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          has_used_referral_code: useReferralCode,
        },
      }
    );

    if (!updateUserPromoStatus) {
      return res
        .status(400)
        .json({ error: "Error occurred while updating the user record." });
    }

    const checkPromoCodeOwner = await User.findOne({ promoCode: promoCode });

    if (!checkPromoCodeOwner) {
      return res.status(400).json({ error: "Promo code not found" });
    }

    //push the email to the promocode owner list
    const updateUser = await User.findOneAndUpdate(
      {
        promoCode: promoCode,
      },
      {
        $push: {
          promoUsers: email.toLowerCase(),
        },
      }
    );

    if (!updateUser) {
      return res.status(400).json({
        error: "Error occured while updating user",
      });
    }

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error occured" });
  }
};

//user management
//all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      res
        .status(400)
        .json({ message: "Error occurred while getting all users" });
    }

    //remove password from the response before sending it to the client
    const usersList = users.map((user) => {
      const { password, ...usersList } = user._doc;
      return usersList;
    });

    //send the formatted list to the client
    res.status(200).json({ data: usersList });
  } catch (err) {
    res.status(500).json({ message: "error occured" || err.message });
  }
};

//return a user
exports.viewUser = async (req, res) => {
  try {
    let id = req.params.id;
    if (!id)
      return res.status(400).json({ message: "Please provide a user ID" });

    let user = await User.findById(id).populate("password");

    if (!user) {
      return res.status(400).json({
        message: "Account with this user ID does not exists.",
      });
    }

    //remove password from response before sending it to the client
    var userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//return a user
exports.viewUserByEmail = async (req, res) => {
  try {
    let email = req.params.email;
    if (!email)
      return res.status(400).json({ message: "Please provide a user email" });

    let user = await User.findOne({ email: email.toLowerCase() }).populate(
      "password"
    );

    if (!user) {
      return res.status(400).json({
        message: "Account with this user email does not exists.",
      });
    }

    //remove password from response before sending it to the client
    var userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete a user
exports.deleteUser = async (req, res) => {
  try {
    let id = req.params.id;
    if (!id)
      return res.status(400).json({ message: "Please provide a user ID" });

    //check if the user ID exists
    let user = await User.findById(id).populate("password");

    if (!user) {
      return res.status(400).json({
        message: "User with this ID does not exist",
      });
    }

    //delete the user if it exists
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(400).json({
        message: "Error occured while deleting user.",
      });
    }
    return res.status(200).json({
      message: "User account has been deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//send message to all user
exports.sendMessage = async (req, res) => {
  try {
    let { body, title, emails, footer, introText } = req.body;

    const { error } = messageValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const subject = title;

    payload = {
      title: title,
      intro: introText,
      body: body,
      footer: footer,
    };

    const senderEmail = '"Sidebrief" <hey@sidebrief.com>';

    const recipientEmail = `${emails.join(", ")}`;

    sendEmail(
      subject,
      payload,
      recipientEmail,
      senderEmail,
      "../view/mail.ejs"
    );

    const saveEmail = new Mail({
      title: title,
      introText: introText,
      body: body,
      footer: footer,
      emails: emails,
    });

    const save = saveEmail.save();
    return res.status(200).json({
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Error occured !" });
  }
};

exports.verifyRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const refreshSecret = process.env.TOKEN_SECRET;

    const decoded = jwt.verify(refreshToken, refreshSecret);
    decoded.id === req.user;
    const user = await User.findById(decoded.id);
    const accessToken = generateToken({ id: user._id.toString() }, "30m");
    const newRefreshToken = generateToken({ id: user._id.toString() }, "2h");

    const currentTime = Date.now();
    const expirationTime = currentTime + 30 * 60 * 1000;

    return res.status(200).json({
      data: {
        accessToken: accessToken,
        newRefreshToken: newRefreshToken,
        tokenExpiresIn: expirationTime,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error occured !" });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          message: "Authentification error, please check your token.",
        });
      } else {
        return res.status(200).json({
          message: "Success.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error occured !" });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          message: "Authentification error, please check your token.",
        });
      } else {
        return res.status(200).json({
          message: "Success.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error occured !" });
  }
};
