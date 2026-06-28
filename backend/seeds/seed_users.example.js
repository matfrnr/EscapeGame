exports.seed = function (knex) {
  return knex("users")
    .del()
    .then(() => {
      return knex("users").insert([
        {
          username: "testuser1",
          password: "hashed_password_here",
          profil_picture: "default.jpg",
        },
        {
          username: "testuser2",
          password: "hashed_password_here",
          profil_picture: "default.jpg",
        },
      ]);
    });
};
