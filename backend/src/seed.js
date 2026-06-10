require('dotenv').config();
const { sequelize, User, Movie, Review, Watchlist, WatchedMovie, Follow } = require('./models');
const { hashPassword } = require('./utils/hash');

const USERS = [
  {
    username: 'demo',
    email: 'demo@letterboxd.com',
    password: 'password123',
    bio: 'Film enthusiast. Always looking for the next great watch.',
  },
  {
    username: 'alice',
    email: 'alice@letterboxd.com',
    password: 'password123',
    bio: 'Criterion Collection addict. Loves slow cinema.',
  },
  {
    username: 'bob',
    email: 'bob@letterboxd.com',
    password: 'password123',
    bio: 'Blockbusters and horror. No shame.',
  },
  {
    username: 'cinephile',
    email: 'cinephile@letterboxd.com',
    password: 'password123',
    bio: 'Watched 2000+ films. Still finding new favorites.',
  },
];

const MOVIES = [
  {
    tmdb_id: 27205,
    title: 'Inception',
    release_date: '2010-07-16',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genres: ['Action', 'Science Fiction', 'Adventure'],
    runtime: 148,
  },
  {
    tmdb_id: 155,
    title: 'The Dark Knight',
    release_date: '2008-07-18',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    runtime: 152,
  },
  {
    tmdb_id: 157336,
    title: 'Interstellar',
    release_date: '2014-11-05',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    runtime: 169,
  },
  {
    tmdb_id: 496243,
    title: 'Parasite',
    release_date: '2019-05-30',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    overview: "All unemployed, Ki-taek's family takes a peculiar interest in the wealthy and glamorous Parks for their livelihood until they find themselves entangled in an unexpected incident.",
    genres: ['Comedy', 'Thriller', 'Drama'],
    runtime: 132,
  },
  {
    tmdb_id: 278,
    title: 'The Shawshank Redemption',
    release_date: '1994-09-23',
    poster_path: '/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg',
    backdrop_path: '/j9XKiZrVeViAixVRzCta7h1VU9W.jpg',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank State Penitentiary.',
    genres: ['Drama', 'Crime'],
    runtime: 142,
  },
  {
    tmdb_id: 238,
    title: 'The Godfather',
    release_date: '1972-03-14',
    poster_path: '/3bhkrj58Vtu7enYsLeMMovrE0is.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    genres: ['Drama', 'Crime'],
    runtime: 175,
  },
  {
    tmdb_id: 680,
    title: 'Pulp Fiction',
    release_date: '1994-09-10',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    genres: ['Thriller', 'Crime'],
    runtime: 154,
  },
  {
    tmdb_id: 424,
    title: "Schindler's List",
    release_date: '1993-12-15',
    poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    backdrop_path: '/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
    overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.",
    genres: ['Drama', 'History', 'War'],
    runtime: 195,
  },
];

const REVIEWS = [
  { userIndex: 0, movieIndex: 0, rating: 9, content: 'A masterpiece of layered storytelling. Each viewing reveals something new. Nolan at his absolute peak.' },
  { userIndex: 0, movieIndex: 1, rating: 10, content: 'The greatest comic book film ever made. Ledger\'s Joker is a performance for the ages.' },
  { userIndex: 0, movieIndex: 2, rating: 8, content: 'Visually stunning and emotionally powerful. The third act gets a little too abstract but the journey is breathtaking.' },
  { userIndex: 1, movieIndex: 3, rating: 10, content: 'Bong Joon-ho delivers a perfect film. Every frame has purpose. The metaphor is sharp and devastating.' },
  { userIndex: 1, movieIndex: 4, rating: 10, content: 'Still the GOAT. Watched it for the tenth time and it still hits hard. Andy Dufresne is one of cinema\'s great characters.' },
  { userIndex: 1, movieIndex: 0, rating: 8, content: 'Incredible world-building. The "we need to go deeper" meme does not do justice to how complex this film actually is.' },
  { userIndex: 2, movieIndex: 1, rating: 9, content: 'Peak Batman. The highway sequence alone is worth the price of admission. Nolan knows how to build tension.' },
  { userIndex: 2, movieIndex: 5, rating: 10, content: 'Brando is untouchable. The dinner table scene alone is more acting than most films manage in their entire runtime.' },
  { userIndex: 2, movieIndex: 6, rating: 9, content: 'Tarantino\'s dialogue is on another level. The diner scene, the "royale with cheese" scene — all legendary.' },
  { userIndex: 3, movieIndex: 7, rating: 10, content: 'Devastating and necessary. Spielberg made sure this story would never be forgotten. Required viewing.' },
  { userIndex: 3, movieIndex: 2, rating: 9, content: 'The docking scene with Hans Zimmer\'s score is one of the most intense sequences I have ever experienced in a cinema.' },
  { userIndex: 3, movieIndex: 3, rating: 9, content: 'Genre-defying genius. Comedy? Thriller? Horror? Yes, all of it and more. The ending will stay with you.' },
];

const FOLLOWS = [
  { followerIndex: 0, followingIndex: 1 },
  { followerIndex: 0, followingIndex: 2 },
  { followerIndex: 0, followingIndex: 3 },
  { followerIndex: 1, followingIndex: 0 },
  { followerIndex: 1, followingIndex: 3 },
  { followerIndex: 2, followingIndex: 0 },
  { followerIndex: 2, followingIndex: 1 },
  { followerIndex: 3, followingIndex: 0 },
];

const WATCHLIST = [
  { userIndex: 0, movieIndex: 3 },
  { userIndex: 0, movieIndex: 5 },
  { userIndex: 1, movieIndex: 6 },
  { userIndex: 1, movieIndex: 7 },
  { userIndex: 2, movieIndex: 2 },
  { userIndex: 2, movieIndex: 4 },
];

const seed = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Database ready');

  await Review.destroy({ where: {} });
  await Watchlist.destroy({ where: {} });
  await WatchedMovie.destroy({ where: {} });
  await Follow.destroy({ where: {} });
  await Movie.destroy({ where: {} });
  await User.destroy({ where: {} });
  console.log('Cleared existing data');

  const createdUsers = await Promise.all(
    USERS.map(async (u) => {
      const password_hash = await hashPassword(u.password);
      return User.create({ username: u.username, email: u.email, password_hash, bio: u.bio });
    })
  );
  console.log(`Created ${createdUsers.length} users`);

  const createdMovies = await Promise.all(
    MOVIES.map((m) => Movie.create(m))
  );
  console.log(`Created ${createdMovies.length} movies`);

  for (const r of REVIEWS) {
    const user = createdUsers[r.userIndex];
    const movie = createdMovies[r.movieIndex];
    await Review.create({ user_id: user.id, movie_id: movie.id, rating: r.rating, content: r.content });
    await WatchedMovie.create({ user_id: user.id, movie_id: movie.id }).catch(() => {});
  }
  console.log(`Created ${REVIEWS.length} reviews`);

  for (const f of FOLLOWS) {
    await Follow.create({
      follower_id: createdUsers[f.followerIndex].id,
      following_id: createdUsers[f.followingIndex].id,
    });
  }
  console.log(`Created ${FOLLOWS.length} follow relationships`);

  for (const w of WATCHLIST) {
    await Watchlist.create({
      user_id: createdUsers[w.userIndex].id,
      movie_id: createdMovies[w.movieIndex].id,
    });
  }
  console.log(`Created ${WATCHLIST.length} watchlist entries`);

  console.log('\n========== SEED COMPLETE ==========');
  console.log('Demo accounts (password: password123)');
  console.log('--------------------------------------');
  USERS.forEach((u) => console.log(`  ${u.username.padEnd(12)} ${u.email}`));
  console.log('====================================\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
