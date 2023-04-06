const router = require("express").Router();
const { usernameVarmi, rolAdiGecerlimi } = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets"); // bu secret'ı kullanın!
const userModel = require("../users/users-model");
const bcryptjs = require("bcryptjs");

router.post("/register", rolAdiGecerlimi, async (req, res, next) => {
  try {
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
});

router.post("/login", usernameVarmi, async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
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
});

module.exports = router;
