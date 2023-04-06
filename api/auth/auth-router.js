const router = require("express").Router();
const {
  usernameVarmi,
  rolAdiGecerlimi,
  sifreDogruMu,
  usernameBostami,
} = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets"); // bu secret'ı kullanın!
const jwt = require("jsonwebtoken");
const userModel = require("../users/users-model");
const bcryptjs = require("bcryptjs");

router.post(
  "/register",
  usernameBostami,
  rolAdiGecerlimi,
  async (req, res, next) => {
    try {
      //!ŞİFREYİ HASHLEDİK
      const hashedPassword = bcryptjs.hashSync(req.body.password, 12);
      const userObj = {
        username: req.body.username,
        password: hashedPassword,
        role_name: req.body.role_name,
      };
      const newUser = await userModel.ekle(userObj);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", usernameVarmi, sifreDogruMu, async (req, res, next) => {
  try {
    const user = await userModel.nameeGoreBul(req.body.username);
    //!TOKEN I TANIMLAYALIM
    const payload = {
      subject: user.user_id,
      username: user.username,
      role_name: user.role_name,
    };
    const secret = JWT_SECRET;
    const options = { expiresIn: "1d" };
    let token = jwt.sign(payload, secret, options);

    res.status(200).json({ message: `${req.body.username} geri geldi`, token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

/**

    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status: 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */

/**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status: 200
    {
      "message": "sue geri geldi!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    Token 1 gün sonra timeout olmalıdır ve aşağıdaki bilgiyi payloadında içermelidir:

    {
      "subject"  : 1       // giriş yapan kullanıcının user_id'si
      "username" : "bob"   // giriş yapan kullanıcının username'i
      "role_name": "admin" // giriş yapan kulanıcının role adı
    }
   */
