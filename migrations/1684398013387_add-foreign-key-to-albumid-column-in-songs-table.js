exports.up = (pgm) => {
  pgm.sql("INSERT INTO albums(id, name, year, created_at, updated_at) VALUES ('old_songs', 'old_songs', 0, '0000-05-18T07:12:22.062Z', '0000-05-18T07:12:22.062Z')");

  pgm.sql("UPDATE songs SET album_id = 'old_songs' WHERE album_id IS NULL");

  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');

  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");

  pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
