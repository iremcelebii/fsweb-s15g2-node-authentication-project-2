const { JWT_SECRET } = require("../secrets"); // bu secreti kullanın!
const userModel = require("../users/users-model");
const bcryptjs = require("bcryptjs");

//!register için
const rolAdiGecerlimi = async (req, res, next) => {
  try {
    if (req.body.role_name) {
      const trimliRoleName = req.body.role_name.trim();
      if (trimliRoleName.length > 32) {
        res
          .status(422)
          .json({ message: "rol adı 32 karakterden fazla olamaz" });
      } else if (trimliRoleName === "admin") {
        res.status(422).json({ message: "Rol adı admin olamaz" });
      } else if (trimliRoleName && trimliRoleName !== "admin") {
        req.body.role_name = trimliRoleName;
        next();
      } else {
        req.body.role_name = "student";
        next();
      }
    } else {
      req.body.role_name = "student";
      next();
    }
  } catch (err) {
    next(err);
  }
};

async function usernameBostami(req, res, next) {
  try {
    const user = await userModel.nameeGoreBul(req.body.username);
    if (!user) {
      next();
    } else {
      res.status(422).json({ message: "Username kullaniliyor" });
    }
  } catch (err) {
    next(err);
  }
}

//!login için
const usernameVarmi = async (req, res, next) => {
  const { username } = req.body;
  const varMi = await userModel.nameeGoreBul(username);
  // console.log(varMi);
  // console.log(username);
  if (varMi !== undefined && varMi.username == username) {
    next();
  } else {
    res.status(401).json({ message: "Geçersiz kriter" });
  }
};
//!login için
async function sifreDogruMu(req, res, next) {
  try {
    const sifreVeUser = await userModel.nameeGoreSıfreBul(req.body.username);
    // console.log(dbdekiSifre); SADECE ŞİFRE GELMİYORMUŞ BURADAN
    if (bcryptjs.compareSync(req.body.password, sifreVeUser.password)) {
      next();
    } else {
      res.status(401).json({ message: "Geçersiz kriter!" }); //yanlış şifre
    }
  } catch (err) {
    next(err);
  }
}

const sinirli = (req, res, next) => {
  /*
    Eğer Authorization header'ında bir token sağlanmamışsa:
    status: 401
    {
      "message": "Token gereklidir"
    }

    Eğer token doğrulanamıyorsa:
    status: 401
    {
      "message": "Token gecersizdir"
    }

    Alt akıştaki middlewarelar için hayatı kolaylaştırmak için kodu çözülmüş tokeni req nesnesine koyun!
  */
};

const sadece = (role_name) => (req, res, next) => {
  /*
    
	Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
	rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
};

module.exports = {
  sinirli,
  usernameVarmi,
  sifreDogruMu,
  rolAdiGecerlimi,
  usernameBostami,
  sadece,
};

/*rolAdiGecerlimi
    Bodydeki role_name geçerliyse, req.role_name öğesini trimleyin ve devam edin.

    Req.body'de role_name eksikse veya trimden sonra sadece boş bir string kaldıysa,
    req.role_name öğesini "student" olarak ayarlayın ve isteğin devam etmesine izin verin.

    Stringi trimledikten sonra kalan role_name 'admin' ise:
    status: 422
    {
      "message": "Rol adı admin olamaz"
    }

    Trimden sonra rol adı 32 karakterden fazlaysa:
    status: 422
    {
      "message": "rol adı 32 karakterden fazla olamaz"
    }
  */

/*usernameVarmi
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
