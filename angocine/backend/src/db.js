const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Determine which database to use based on environment variables
const USE_SQLITE = process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL;

let pool;
let db;

// Create database directory if it doesn't exist (for SQLite)
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite database file path
const sqliteDbPath = path.join(dbDir, 'angocine.sqlite');

// Initialize database connection
const initializeDatabase = async () => {
  if (USE_SQLITE) {
    console.log('Using SQLite database');
    return initializeSQLite();
  } else {
    console.log('Using PostgreSQL database');
    return initializePostgreSQL();
  }
};

// Initialize PostgreSQL connection
const initializePostgreSQL = async () => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();

    // Create tables
    await createPostgreSQLTables();
    
    // Seed data if needed
    if (process.env.SEED_DATA === 'true') {
      await seedData();
    }

    return pool;
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
    throw err;
  }
};

// Initialize SQLite connection
const initializeSQLite = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(sqliteDbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async (err) => {
      if (err) {
        console.error('SQLite connection error:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      try {
        // Create tables
        await createSQLiteTables();
        
        // Seed data
        await seedData();
        
        resolve(db);
      } catch (err) {
        reject(err);
      }
    });
  });
};

// Create PostgreSQL tables
const createPostgreSQLTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        avatar VARCHAR(255),
        is_kid BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Movies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        release_year INTEGER,
        duration INTEGER,
        genre VARCHAR(100),
        director VARCHAR(100),
        cast TEXT,
        poster_url VARCHAR(255),
        backdrop_url VARCHAR(255),
        trailer_url VARCHAR(255),
        video_url VARCHAR(255),
        rating DECIMAL(2,1),
        language VARCHAR(50),
        maturity_rating VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Watchlist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id)
      )
    `);

    // Watch history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        watch_time INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating PostgreSQL tables:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Create SQLite tables
const createSQLiteTables = () => {
  return new Promise((resolve, reject) => {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        avatar TEXT,
        is_kid INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Movies table
      `CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        release_year INTEGER,
        duration INTEGER,
        genre TEXT,
        director TEXT,
        cast TEXT,
        poster_url TEXT,
        backdrop_url TEXT,
        trailer_url TEXT,
        video_url TEXT,
        rating REAL,
        language TEXT,
        maturity_rating TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Reviews table
      `CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        movie_id INTEGER,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
      )`,
      
      // Watchlist table
      `CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        movie_id INTEGER,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
      )`,
      
      // Watch history table
      `CREATE TABLE IF NOT EXISTS watch_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER,
        movie_id INTEGER,
        watch_time INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
      )`,
      
      // Analytics events table
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER,
        movie_id INTEGER,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
      )`
    ];

    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');
      
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        let completed = 0;
        
        queries.forEach((query) => {
          db.run(query, (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            completed++;
            if (completed === queries.length) {
              db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          });
        });
      });
    });
  });
};

// Seed data function
const seedData = async () => {
  if (USE_SQLITE) {
    return seedSQLiteData();
  } else {
    return seedPostgreSQLData();
  }
};

// Seed data for PostgreSQL
const seedPostgreSQLData = async () => {
  const client = await pool.connect();
  
  try {
    // Check if movies table is empty
    const { rows } = await client.query('SELECT COUNT(*) FROM movies');
    
    if (parseInt(rows[0].count) > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }
    
    console.log('Seeding PostgreSQL database...');
    
    // Admin user
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@angocine.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8iBFZPxFJkjPJO', 'admin')
    `);
    
    // Sample user
    await client.query(`
      INSERT INTO users (username, email, password)
      VALUES ('user', 'user@angocine.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8iBFZPxFJkjPJO')
    `);
    
    // Sample profiles
    await client.query(`
      INSERT INTO profiles (user_id, name, avatar, is_kid)
      VALUES 
        (2, 'User', 'https://i.pravatar.cc/150?img=3', false),
        (2, 'Kids', 'https://i.pravatar.cc/150?img=8', true)
    `);
    
    // Sample movies
    const movies = getMovieSeedData();
    
    for (const movie of movies) {
      await client.query(`
        INSERT INTO movies (
          title, description, release_year, duration, genre, director, cast,
          poster_url, backdrop_url, trailer_url, video_url, rating, language, maturity_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        movie.title, movie.description, movie.release_year, movie.duration, movie.genre,
        movie.director, movie.cast, movie.poster_url, movie.backdrop_url, movie.trailer_url,
        movie.video_url, movie.rating, movie.language, movie.maturity_rating
      ]);
    }
    
    console.log('PostgreSQL database seeded successfully');
  } catch (err) {
    console.error('Error seeding PostgreSQL database:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Seed data for SQLite
const seedSQLiteData = () => {
  return new Promise((resolve, reject) => {
    // Check if movies table is empty
    db.get('SELECT COUNT(*) as count FROM movies', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        console.log('Database already seeded, skipping...');
        resolve();
        return;
      }
      
      console.log('Seeding SQLite database...');
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Admin user (password: admin123)
          db.run(`
            INSERT INTO users (username, email, password, role)
            VALUES ('admin', 'admin@angocine.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8iBFZPxFJkjPJO', 'admin')
          `, function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // Sample user (password: user123)
            db.run(`
              INSERT INTO users (username, email, password)
              VALUES ('user', 'user@angocine.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8iBFZPxFJkjPJO')
            `, function(err) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              // Sample profiles
              db.run(`
                INSERT INTO profiles (user_id, name, avatar, is_kid)
                VALUES (2, 'User', 'https://i.pravatar.cc/150?img=3', 0)
              `, function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                db.run(`
                  INSERT INTO profiles (user_id, name, avatar, is_kid)
                  VALUES (2, 'Kids', 'https://i.pravatar.cc/150?img=8', 1)
                `, function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  // Sample movies
                  const movies = getMovieSeedData();
                  let completed = 0;
                  
                  movies.forEach((movie) => {
                    db.run(`
                      INSERT INTO movies (
                        title, description, release_year, duration, genre, director, cast,
                        poster_url, backdrop_url, trailer_url, video_url, rating, language, maturity_rating
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      movie.title, movie.description, movie.release_year, movie.duration, movie.genre,
                      movie.director, movie.cast, movie.poster_url, movie.backdrop_url, movie.trailer_url,
                      movie.video_url, movie.rating, movie.language, movie.maturity_rating
                    ], function(err) {
                      if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      }
                      
                      completed++;
                      if (completed === movies.length) {
                        db.run('COMMIT', (err) => {
                          if (err) {
                            reject(err);
                          } else {
                            console.log('SQLite database seeded successfully');
                            resolve();
                          }
                        });
                      }
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Movie seed data
const getMovieSeedData = () => {
  return [
    {
      title: "Duna: Parte Dois",
      description: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo, ele deve evitar um futuro terrível que só ele pode prever.",
      release_year: 2024,
      duration: 166,
      genre: "Ficção Científica, Aventura",
      director: "Denis Villeneuve",
      cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Josh Brolin",
      poster_url: "https://image.tmdb.org/t/p/w500/jQNOzoiaIQWxJAx8OUighnvnhRA.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/jZIYaISP3GBSrVOPfrp98AMa8Ng.jpg",
      trailer_url: "https://www.youtube.com/watch?v=Way9Dexny3w",
      video_url: "/videos/sample-video.mp4",
      rating: 8.5,
      language: "Inglês",
      maturity_rating: "PG-13"
    },
    {
      title: "Oppenheimer",
      description: "A história do cientista americano J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica durante a Segunda Guerra Mundial.",
      release_year: 2023,
      duration: 180,
      genre: "Drama, História",
      director: "Christopher Nolan",
      cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.",
      poster_url: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
      trailer_url: "https://www.youtube.com/watch?v=bK6ldnjE3Y0",
      video_url: "/videos/sample-video.mp4",
      rating: 8.9,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Pobres Criaturas",
      description: "A jovem Bella Baxter é trazida de volta à vida pelo brilhante e não convencional cientista Dr. Godwin Baxter. Sob a proteção de Baxter, Bella está ansiosa para aprender. Desejando conhecer mais sobre o mundo, Bella foge com Duncan Wedderburn, um advogado astuto e debochado, em uma aventura por continentes.",
      release_year: 2023,
      duration: 141,
      genre: "Ficção Científica, Romance, Comédia",
      director: "Yorgos Lanthimos",
      cast: "Emma Stone, Mark Ruffalo, Willem Dafoe, Ramy Youssef",
      poster_url: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
      trailer_url: "https://www.youtube.com/watch?v=RlbR5N6veqw",
      video_url: "/videos/sample-video.mp4",
      rating: 8.1,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Zona de Interesse",
      description: "O comandante de Auschwitz, Rudolf Höss, e sua esposa Hedwig, se esforçam para construir uma vida de sonho para sua família em uma casa com jardim próxima ao campo de concentração.",
      release_year: 2023,
      duration: 105,
      genre: "Drama, História, Guerra",
      director: "Jonathan Glazer",
      cast: "Christian Friedel, Sandra Hüller, Johann Karthaus, Luis Noah Witte",
      poster_url: "https://image.tmdb.org/t/p/w500/A0EX5DVNRIiDOKnUQZVSwoUFj3x.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/7TdVWAO2VV6EH9Iiw1HA9Od0OOQ.jpg",
      trailer_url: "https://www.youtube.com/watch?v=9mAw0gAZuRE",
      video_url: "/videos/sample-video.mp4",
      rating: 7.8,
      language: "Alemão",
      maturity_rating: "R"
    },
    {
      title: "Anatomia de uma Queda",
      description: "Uma mulher é suspeita da morte do marido e seu filho cego enfrenta um dilema moral como única testemunha.",
      release_year: 2023,
      duration: 150,
      genre: "Drama, Crime, Mistério",
      director: "Justine Triet",
      cast: "Sandra Hüller, Swann Arlaud, Milo Machado Graner",
      poster_url: "https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/hzZ1Qe7HumaTu4TFAIxx2wNl9Ij.jpg",
      trailer_url: "https://www.youtube.com/watch?v=pRpKNbVVt-M",
      video_url: "/videos/sample-video.mp4",
      rating: 7.9,
      language: "Francês",
      maturity_rating: "R"
    },
    {
      title: "Barbie",
      description: "Barbie e Ken estão tendo o melhor dos tempos em Barbieland colorido e aparentemente perfeito. No entanto, quando eles têm a oportunidade de ir para o mundo real, eles logo descobrem as alegrias e os perigos de viver entre os humanos.",
      release_year: 2023,
      duration: 114,
      genre: "Comédia, Aventura, Fantasia",
      director: "Greta Gerwig",
      cast: "Margot Robbie, Ryan Gosling, America Ferrera, Kate McKinnon",
      poster_url: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/nHf61UzkfFno5X1ofIhugCPus2R.jpg",
      trailer_url: "https://www.youtube.com/watch?v=pBk4NYhWNMM",
      video_url: "/videos/sample-video.mp4",
      rating: 7.0,
      language: "Inglês",
      maturity_rating: "PG-13"
    },
    {
      title: "Assassino por Acaso",
      description: "Um assassino profissional sofre um acidente que o faz perder a memória. Ele acorda acreditando que é um ator de comédia stand-up. Quando seu passado violento o alcança, ele redescobre suas habilidades letais de maneiras surpreendentemente hilárias.",
      release_year: 2024,
      duration: 117,
      genre: "Ação, Comédia",
      director: "Richard Linklater",
      cast: "Glen Powell, Adria Arjona, Retta, Molly Bernard",
      poster_url: "https://image.tmdb.org/t/p/w500/aPQsU3yLDUOhLJYnSqkhKRkQTAw.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/5YnhQwBV91DG1ySqrSWfzXkWvTN.jpg",
      trailer_url: "https://www.youtube.com/watch?v=9xKWS_NZ7e0",
      video_url: "/videos/sample-video.mp4",
      rating: 7.3,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Godzilla e Kong: O Novo Império",
      description: "Godzilla e Kong unem forças contra uma ameaça colossal escondida em nosso mundo, desafiando sua própria existência e a nossa.",
      release_year: 2024,
      duration: 115,
      genre: "Ação, Ficção Científica, Aventura",
      director: "Adam Wingard",
      cast: "Rebecca Hall, Brian Tyree Henry, Dan Stevens, Kaylee Hottle",
      poster_url: "https://image.tmdb.org/t/p/w500/qmP8K63EmHKxco68XvAK2yzXgAm.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/zPcuuhFoRGQDr1n2yvxlCvBGSH8.jpg",
      trailer_url: "https://www.youtube.com/watch?v=odM92ap8_c0",
      video_url: "/videos/sample-video.mp4",
      rating: 7.0,
      language: "Inglês",
      maturity_rating: "PG-13"
    },
    {
      title: "Planeta dos Macacos: O Reinado",
      description: "Muitas gerações no futuro, após o reinado de César, os macacos são a espécie dominante e os humanos vivem nas sombras. Um novo líder tirano constrói seu império, enquanto um jovem macaco empreende uma jornada angustiante que o levará a questionar tudo o que sabia sobre o passado e a fazer escolhas que definirão o futuro para macacos e humanos.",
      release_year: 2024,
      duration: 145,
      genre: "Ficção Científica, Aventura, Ação",
      director: "Wes Ball",
      cast: "Owen Teague, Freya Allan, Kevin Durand, Peter Macon",
      poster_url: "https://image.tmdb.org/t/p/w500/jLLtx3nTRSbILZ74qveP1x4SNe.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/6OnoMgGFuZ921eV8v8yEyXoag19.jpg",
      trailer_url: "https://www.youtube.com/watch?v=6sxn3kbgEiU",
      video_url: "/videos/sample-video.mp4",
      rating: 7.2,
      language: "Inglês",
      maturity_rating: "PG-13"
    },
    {
      title: "Divertida Mente 2",
      description: "A adolescente Riley começa a ser guiada por novas emoções: Ansiedade, Inveja, Tédio e Vergonha. Enquanto isso, Alegria, Tristeza, Raiva, Medo e Nojinho, que há muito tempo administram uma operação bem-sucedida, não têm certeza de como se sentir quando a sede é expandida.",
      release_year: 2024,
      duration: 96,
      genre: "Animação, Comédia, Família",
      director: "Kelsey Mann",
      cast: "Amy Poehler, Phyllis Smith, Lewis Black, Tony Hale",
      poster_url: "https://image.tmdb.org/t/p/w500/7tBvUMyGgMxvQMB3U64QKIcBevT.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/AhifyrSNkRVFMJ94CEMfBv1FaMz.jpg",
      trailer_url: "https://www.youtube.com/watch?v=VrQu4GrHl9o",
      video_url: "/videos/sample-video.mp4",
      rating: 8.0,
      language: "Inglês",
      maturity_rating: "PG"
    },
    {
      title: "Twisters",
      description: "Kate Cooper, uma ex-caçadora de tempestades assombrada por um encontro devastador com um tornado durante seus anos de faculdade, agora estuda padrões de tempestades em seu computador em Nova York. Ela é atraída de volta ao campo por seu amigo Javi para testar um novo sistema de rastreamento, onde se junta ao imprudente caçador de tempestades Tyler Owens e sua equipe.",
      release_year: 2024,
      duration: 122,
      genre: "Ação, Drama, Aventura",
      director: "Lee Isaac Chung",
      cast: "Daisy Edgar-Jones, Glen Powell, Anthony Ramos, Brandon Perea",
      poster_url: "https://image.tmdb.org/t/p/w500/gIbDjxwOgEwLKkOeUWnQrWBFQGl.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/ufWw2aJRVjz2M3GKsKEUgQQYJNm.jpg",
      trailer_url: "https://www.youtube.com/watch?v=GwXFVqKuH-w",
      video_url: "/videos/sample-video.mp4",
      rating: 7.1,
      language: "Inglês",
      maturity_rating: "PG-13"
    },
    {
      title: "Deadpool & Wolverine",
      description: "Wolverine está aposentado, mas é recrutado por Deadpool para salvar o universo Fox de super-heróis.",
      release_year: 2024,
      duration: 127,
      genre: "Ação, Comédia, Ficção Científica",
      director: "Shawn Levy",
      cast: "Ryan Reynolds, Hugh Jackman, Emma Corrin, Morena Baccarin",
      poster_url: "https://image.tmdb.org/t/p/w500/4yGhkUUFJqfYGkRJQrENhEgKUdj.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/yOm993lsJyPmBodlYjgpPwBjXP9.jpg",
      trailer_url: "https://www.youtube.com/watch?v=uTLWzHhH2NM",
      video_url: "/videos/sample-video.mp4",
      rating: 7.9,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Alien: Romulus",
      description: "Um grupo de jovens colonizadores espaciais explora as profundezas de uma estação espacial abandonada, onde encontram uma das formas de vida mais perigosas do universo.",
      release_year: 2024,
      duration: 119,
      genre: "Ficção Científica, Terror, Thriller",
      director: "Fede Alvarez",
      cast: "Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced",
      poster_url: "https://image.tmdb.org/t/p/w500/dB5vP9rfJ5y7rXm1XDJgDjKQHtc.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/bQTfSXQrcVwXJ5TvNzbd3ioMnnM.jpg",
      trailer_url: "https://www.youtube.com/watch?v=Wd4jKXiI9B0",
      video_url: "/videos/sample-video.mp4",
      rating: 7.0,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Coringa: Delírio a Dois",
      description: "Arthur Fleck está internado em Arkham quando se apaixona por sua terapeuta, Harley Quinn. Juntos, eles embarcam em uma jornada musical de crime e paixão pelas ruas de Gotham City.",
      release_year: 2024,
      duration: 138,
      genre: "Crime, Thriller, Drama",
      director: "Todd Phillips",
      cast: "Joaquin Phoenix, Lady Gaga, Brendan Gleeson, Zazie Beetz",
      poster_url: "https://image.tmdb.org/t/p/w500/gKkl37BQWbR3H9T9Jd7eHSLGOof.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/7NRGVoGnj9MlzXeW6KTBbUXAiQb.jpg",
      trailer_url: "https://www.youtube.com/watch?v=B9tDR8WxsdU",
      video_url: "/videos/sample-video.mp4",
      rating: 6.5,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Venom: A Última Rodada",
      description: "Eddie Brock e Venom estão fugindo. Perseguidos por seus dois mundos e com o cerco se fechando, a dupla é forçada a tomar uma decisão devastadora que encerrará a relação entre o anfitrião e o simbionte.",
      release_year: 2024,
      duration: 116,
      genre: "Ficção Científica, Ação, Aventura",
      director: "Kelly Marcel",
      cast: "Tom Hardy, Chiwetel Ejiofor, Juno Temple, Rhys Ifans",
      poster_url: "https://image.tmdb.org/t/p/w500/vKUoRaZwNdpzJBBxdJwZZ7YVaV9.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/wrThRSByMQH8aHlNlJFLiK0W5FL.jpg",
      trailer_url: "https://www.youtube.com/watch?v=pTGu0TZq0QE",
      video_url: "/videos/sample-video.mp4",
      rating: 6.8,
      language: "Inglês",
      maturity_rating: "PG-13"
    },
    {
      title: "Gladiador II",
      description: "Anos após testemunhar a morte do herói Maximus pelas mãos de seu tio, Lucius é forçado a entrar no Coliseu após sua casa ser conquistada pelos tirânicos imperadores que agora lideram Roma com mão de ferro.",
      release_year: 2024,
      duration: 155,
      genre: "Ação, Aventura, Drama",
      director: "Ridley Scott",
      cast: "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen",
      poster_url: "https://image.tmdb.org/t/p/w500/fTQVBY8KK0RX9eHJ4Otj0CQxBKu.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/8xTzD2F1OKJBmEzTrQqc9JBIUw8.jpg",
      trailer_url: "https://www.youtube.com/watch?v=LwlJTnpJQiE",
      video_url: "/videos/sample-video.mp4",
      rating: 8.2,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Furiosa: Uma Saga Mad Max",
      description: "Quando o mundo entra em colapso, a jovem Furiosa é sequestrada do Green Place das Muitas Mães e cai nas mãos de uma grande Horda de Motoqueiros liderada pelo Senhor da Guerra Dementus. Atravessando o Deserto, eles encontram a Cidadela presidida por Immortan Joe. Enquanto os dois tiranos lutam pelo domínio, Furiosa deve sobreviver a muitas provações enquanto reúne os meios para encontrar o caminho de volta para casa.",
      release_year: 2024,
      duration: 148,
      genre: "Ação, Aventura, Ficção Científica",
      director: "George Miller",
      cast: "Anya Taylor-Joy, Chris Hemsworth, Tom Burke, Yahya Abdul-Mateen II",
      poster_url: "https://image.tmdb.org/t/p/w500/nz5DxrX4w1e0qfwGxRrMRVN9O3c.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/uLtVbjvS1O7gXL8lUOwsFOH4man.jpg",
      trailer_url: "https://www.youtube.com/watch?v=XdKzUbAiswE",
      video_url: "/videos/sample-video.mp4",
      rating: 7.1,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Megalópolis",
      description: "Após um desastre devastador, um arquiteto visionário tenta reconstruir Nova Roma como uma utopia contra a vontade de um político corrupto.",
      release_year: 2024,
      duration: 138,
      genre: "Drama, Ficção Científica",
      director: "Francis Ford Coppola",
      cast: "Adam Driver, Giancarlo Esposito, Nathalie Emmanuel, Aubrey Plaza",
      poster_url: "https://image.tmdb.org/t/p/w500/8NmSiuWKrfwqPGIVBxew6GSzXYD.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/gg4zZoTggZmpAQ32qIrP5dtnkEZ.jpg",
      trailer_url: "https://www.youtube.com/watch?v=Xow3VSdLYTw",
      video_url: "/videos/sample-video.mp4",
      rating: 6.9,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Nosferatu",
      description: "Na Alemanha do século 19, uma jovem se torna o objeto de obsessão de um antigo vampiro da Transilvânia. O que se segue é uma história de horror e desejo, enquanto ela é perseguida por um mal inimaginável.",
      release_year: 2024,
      duration: 133,
      genre: "Terror, Fantasia",
      director: "Robert Eggers",
      cast: "Bill Skarsgård, Lily-Rose Depp, Nicholas Hoult, Willem Dafoe",
      poster_url: "https://image.tmdb.org/t/p/w500/gZku2djK7XVjqhdjE0rQkqvcYrG.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/8GnWDLn2AhnmkQ7hlQ9NJUYobSS.jpg",
      trailer_url: "https://www.youtube.com/watch?v=EIpBl0jG5pc",
      video_url: "/videos/sample-video.mp4",
      rating: 7.5,
      language: "Inglês",
      maturity_rating: "R"
    },
    {
      title: "Wicked",
      description: "Muito antes de Dorothy chegar, duas outras garotas se conheceram na Terra de Oz. Elphaba, uma jovem incompreendida devido à sua pele verde, e Glinda, uma jovem popular e privilegiada. 'Wicked' conta a história de como essas improváveis amigas se tornaram a Bruxa Má do Oeste e a Bruxa Boa do Sul.",
      release_year: 2024,
      duration: 160,
      genre: "Fantasia, Aventura, Musical",
      director: "Jon M. Chu",
      cast: "Cynthia Erivo, Ariana Grande, Jonathan Bailey, Jeff Goldblum",
      poster_url: "https://image.tmdb.org/t/p/w500/zaXdRG8bCfLmD8uyqzDR8zDEJhA.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/xgDj56UWyeWQcxAa0n5QJD5rBOG.jpg",
      trailer_url: "https://www.youtube.com/watch?v=zfF9TxGz0gE",
      video_url: "/videos/sample-video.mp4",
      rating: 8.4,
      language: "Inglês",
      maturity_rating: "PG"
    },
    {
      title: "Mufasa: O Rei Leão",
      description: "A história de origem de Mufasa, contando sua jornada de órfão solitário até se tornar o lendário Rei das Terras do Orgulho, narrada por Rafiki, Timão e Pumba para o jovem filhote de Simba.",
      release_year: 2024,
      duration: 120,
      genre: "Animação, Aventura, Drama",
      director: "Barry Jenkins",
      cast: "Aaron Pierre, Kelvin Harrison Jr., Seth Rogen, Billy Eichner",
      poster_url: "https://image.tmdb.org/t/p/w500/7mbXZXJADOOwxPIQJMYN0uP2QSS.jpg",
      backdrop_url: "https://image.tmdb.org/t/p/original/eiIXNQBKtj5AA6sPZWjvSZkHnCl.jpg",
      trailer_url: "https://www.youtube.com/watch?v=NsKkpWxZBWA",
      video_url: "/videos/sample-video.mp4",
      rating: 7.8,
      language: "Inglês",
      maturity_rating: "PG"
    }
  ];
};

// Query functions for PostgreSQL
const pgQuery = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Query functions for SQLite
const sqliteQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

// Query function that works with both databases
const query = async (text, params = []) => {
  if (USE_SQLITE) {
    return sqliteQuery(text, params);
  } else {
    const result = await pgQuery(text, params);
    return result.rows;
  }
};

// Export functions
module.exports = {
  initializeDatabase,
  query,
  USE_SQLITE
};