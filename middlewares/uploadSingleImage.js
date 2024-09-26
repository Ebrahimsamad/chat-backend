const imagekit = require("../utils/ImageKit");
const sharp = require("sharp");
const CustomError = require("../utils/customError");

const singleImageUpload = async (req, res, next) => {
  if (!req.files || !req.files["IDImage"] || req.files["IDImage"].length === 0) {
    return next();
  }

  try {
    const imageBuffer = req.files["IDImage"][0].buffer;
    const optimizedImageBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 70 })
      .toBuffer();

    const uploadResponse = await imagekit.upload({
      file: optimizedImageBuffer,
      fileName: `IDImage-${req.body.email}-${Date.now()}.jpeg`,
      folder: "kiro",
    });

    req.body.IDImage = uploadResponse.url;

    next();
  } catch (err) {
    return next(new CustomError("IDImage upload failed", 500));
  }
};

module.exports = singleImageUpload;
