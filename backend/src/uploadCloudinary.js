const multer = require("multer");
const stream = require("stream");
const cloudinary = require("cloudinary");

if (!process.env.CLOUDINARY_URL) {
  console.error(
    "*******************************************************************************"
  );
  console.error(
    "**********          CLOUDINARY_URL is not set in environment         **********"
  );
  console.error(
    "*******************************************************************************"
  );
}

const doUpload = (publicId, req, res, next) => {
  const options = { resource_type: "auto" };
  if (publicId) {
    options.public_id = publicId;
  }

  const uploadStream = cloudinary.v2.uploader.upload_stream(
    options,
    (error, result) => {
      if (error) {
        return res.status(500).send({ error: "Cloudinary upload failed" });
      }
      // capture the url and public_id and add to the request
      req.file.url = result.url;
      req.file.public_id = result.public_id;
      next();
    }
  );

  // pipe the buffer to the upload stream
  const s = new stream.PassThrough();
  s.end(req.file.buffer);
  s.pipe(uploadStream);
  s.on("end", uploadStream.end);
};

// multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// middleware to upload the image to cloudinary
const uploadImage = (publicIdProvider) => (req, res, next) => {
  // check if the file is present
  if (!req.file) {
    next();
    return;
  }

  const publicId =
    typeof publicIdProvider === "function"
      ? publicIdProvider(req)
      : publicIdProvider;

  // upload the image to cloudinary
  doUpload(publicId, req, res, next);
};

module.exports = uploadImage;
module.exports.upload = upload;
