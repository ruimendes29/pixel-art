-- Database schema for the Pixel Art backend.
-- Usage: mysql -u <user> -p <database> < schema.sql

-- Images (profile photos and saved canvases) are stored in the database itself,
-- so the backend needs no persistent disk.
CREATE TABLE IF NOT EXISTS Image (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data LONGBLOB NOT NULL,
  mime VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  photo INT,
  FOREIGN KEY (photo) REFERENCES Image(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Grupo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (owner) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Project (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  author INT NOT NULL,
  grupo INT,
  description TEXT,
  shared BOOLEAN NOT NULL DEFAULT FALSE,
  size INT NOT NULL,
  image INT,
  FOREIGN KEY (author) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (grupo) REFERENCES Grupo(id) ON DELETE SET NULL,
  FOREIGN KEY (image) REFERENCES Image(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Tag (
  projectId INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (projectId, name),
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Likes (
  userId INT NOT NULL,
  postId INT NOT NULL,
  PRIMARY KEY (userId, postId),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES Project(id) ON DELETE CASCADE
);
