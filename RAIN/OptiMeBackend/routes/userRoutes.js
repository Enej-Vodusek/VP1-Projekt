const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/me", authMiddleware, controller.me);

router.post("/register", controller.register);
router.post("/startingForm", authMiddleware, controller.saveForm); //middleware works best in routes just before controller is called

router.post("/login", controller.login);
router.post("/logout", controller.logout);

router.get("/profile", authMiddleware, controller.userProfile);

router.post(
  "/2fa",
  authMiddleware,
  upload.single("image"),
  controller.verify2FA,
); //Za Two-Factor-Authentication
router.post("/toggle-2fa", authMiddleware, controller.toggle2FA);

router.post("/test-upload", controller.upload2FA, (req, res) => {
  console.log(req.file);

  res.json({
    success: true,
    file: req.file,
  });
});

module.exports = router;
