exports.seed = function(knex) {
  return knex('users').del().then(() => {
    return knex('users').insert([
      { username: 'polomp12', password: 'polomp12', profil_picture: 'default.jps' },
      { username: 'kilian', password: 'kilian', profil_picture: 'default.jpg' }
    ]);
  });
};