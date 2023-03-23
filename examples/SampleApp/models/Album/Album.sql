/*
  @name listAlbums
  @param artistIds -> (...)
*/
SELECT * FROM albums
WHERE artist_id IN :artistIds!;

/* @name getAlbum */
SELECT * FROM albums
WHERE album_id = :albumId!;

/*
  @name listAlbumsWithTracks
  @param albumIds -> (...)
*/
SELECT
  a.*,
  t.track_id,
  t.track_name,
  t.media_url,
  t.created_at AS track_created_at
FROM albums a
LEFT JOIN tracks t USING (album_id)
WHERE album_id IN :albumIds!;

/*
  @name createAlbum
  @param album -> (
    artistId,
    albumName,
    coverArtUrl,
    releasedAt,
  )
*/
INSERT INTO albums (artist_id, album_name, cover_art_url, released_at)
VALUES :album
RETURNING *;

/* @name updateAlbum */
UPDATE albums
SET cover_art_url = :coverArtUrl!
WHERE album_id = :albumId!;

/* @name deleteAlbum */
DELETE FROM albums
WHERE album_id = :albumId!;
