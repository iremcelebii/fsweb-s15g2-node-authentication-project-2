const db = require("../../data/db-config.js");

async function bul() {
  return await db("users")
    .leftJoin("roles", "users.role_id", "roles.role_id")
    .select("users.user_id", "users.username", "roles.role_name");

  /**
    [
      {
        "user_id": 1,
        "username": "bob",
        "role_name": "admin"
      },
      {
        "user_id": 2,
        "username": "sue",
        "role_name": "instructor"
      }
    ]
   */
}

async function goreBul(filtre) {
  return await db("users")
    .leftJoin("roles", "users.role_id", "roles.role_id")
    .select(
      "users.user_id",
      "users.username",
      "users.password",
      "roles.role_name"
    )
    .where(filtre);

  /**
    [
      {
        "user_id": 1,
        "username": "bob",
        "password": "$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq",
        "role_name": "admin",
      }
    ]
   */
}

async function idyeGoreBul(user_id) {
  return await db("users")
    .leftJoin("roles", "users.role_id", "roles.role_id")
    .select("users.user_id", "users.username", "roles.role_name")
    .where("users.user_id", user_id)
    .first();

  /**
    {
      "user_id": 2,
      "username": "sue",
      "role_name": "instructor"
    }
   */
}

async function nameeGoreBul(username) {
  return await db("users")
    .leftJoin("roles", "users.role_id", "roles.role_id")
    .select("users.user_id", "users.username", "roles.role_name")
    .where("users.username", username)
    .first();
}

async function roluBul(role_name) {
  return await db("roles").where("role_name", role_name).first();

  /**
    {
      "user_id": 2,
      "username": "sue",
      "role_name": "instructor"
    }
   */
}
async function nameeGoreSıfreBul(username) {
  const user = await db("users")
    .select("username", "password")
    .where("username", username)
    .first();

  return user;
}

/**
  Kullanıcı oluşturmak için tek bir insert varsa (users tablosuna) eğer verilen role_name db'de mevcutsa
  ya da 2 insert varsa (önce roles ve sonra users tablosuna)
  role_name dbde kayıtlı değilse.

  Kullanıcı oluşturmak gibi bir işlem birden fazla tabloya veri ekliyorsa,
  tüm operasyonların başarılı veya başarısız olmasını isteriz. Eğer yeni role eklenemezse
  kullanıcı eklemesinin de başarısız olması gerekir.

  Bu gibi durumlarda şu işlemleri kullanırız: işlemin içindeki herhangi birisi başarısız olursa,
  tüm veritabanı içindeki değişiklikler geri alınır

  {
    "user_id": 7,
    "username": "anna",
    "role_name": "team lead"
  }
 */
async function ekle({ username, password, role_name }) {
  // bu kısım hazır
  let created_user_id;
  await db.transaction(async (trx) => {
    let role_id_to_use;
    const [role] = await trx("roles").where("role_name", role_name);
    if (role) {
      role_id_to_use = role.role_id;
    } else {
      const [role_id] = await trx("roles").insert({ role_name: role_name });
      role_id_to_use = role_id;
    }
    const [user_id] = await trx("users").insert({
      username,
      password,
      role_id: role_id_to_use,
    });
    created_user_id = user_id;
  });
  return idyeGoreBul(created_user_id);
}

module.exports = {
  ekle,
  bul,
  goreBul,
  idyeGoreBul,
  roluBul,
  nameeGoreBul,
  nameeGoreSıfreBul,
};
