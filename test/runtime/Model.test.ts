import t from "tap"
import {v4 as uuid} from "uuid"
import {pool} from "../../examples/SampleApp/models/connection"
import {AlbumModel} from "../../examples/SampleApp/models/Album"

function createAlbumRow(albumName: string, releasedAt: string) {
  return {
    album_id: uuid(),
    artist_id: uuid(),
    album_name: albumName,
    released_at: releasedAt,
  }
}

const albums = [
  createAlbumRow("Strange Days", "1967-09-25"),
  createAlbumRow("The Dark Side of the Moon", "1973-03-01"),
]

t.before(async () => {
  const [a1, a2] = albums
  await pool.query(`
    INSERT INTO albums (album_id, artist_id, album_name, cover_art_url, released_at)
    VALUES
      ('${a1.album_id}', '${a1.artist_id}', '${a1.album_name}', '', '${a1.released_at}'),
      ('${a2.album_id}', '${a2.artist_id}', '${a2.album_name}', '', '${a2.released_at}');
  `)
})

t.teardown(async () => {
  const albumIds = albums.map(({album_id}) => album_id)
  const inAlbumIds = albumIds.map((albumId) => `'${albumId}'`).join(", ")
  await pool.query(`
    DELETE FROM albums
    WHERE album_id IN (${inAlbumIds});
  `)
  pool.end()
})

t.test("AlbumModel", async (t) => {
  t.test("Get single row", async (t) => {
    t.jobs = 10
    t.test("Existing entity", async (t) => {
      const albumId = albums[0].album_id
      const result = await AlbumModel.getAlbum({albumId})
      t.ok(
        typeof result === "object" && !Array.isArray(result),
        "Returns an object",
      )
    })
    t.test("Non-existant entity", async (t) => {
      const albumId = uuid()
      const album = await AlbumModel.getAlbum({albumId})
      t.equal(album?.albumId, undefined, "Returns undefined")
    })
  })

  t.test("Get multiple rows", async (t) => {
    t.test(".listAlbums() returns all rows", async (t) => {
      const artistIds = albums.map(({artist_id}) => artist_id)
      const results = await AlbumModel.listAlbums({artistIds})
      t.equal(results.length, albums.length, "Returns correct number of rows")
    })
  })

  t.test("Get grouped rows", async (t) => {
    t.test(".createAlbum() returns a new row", async (t) => {
      const artistIds = albums.map(({artist_id}) => artist_id)
      const result = await AlbumModel.listAlbumsByArtistId({artistIds})
      t.equal(typeof result, "object", "Returns an object")
      t.equal(
        Object.keys(result).length,
        artistIds.length,
        "With every artistId as a key",
      )
      t.ok(
        Object.values(result).every((albums) => Array.isArray(albums)),
        "With every value as an array of one album",
      )
    })
  })

  t.test("Get nested rows", async (t) => {
    t.test(".createAlbum() returns a new row", async (t) => {
      const albumIds = albums.map(({album_id}) => album_id)
      const result = await AlbumModel.listAlbumsWithTracks({albumIds})
      t.ok(Array.isArray(result), "Returns an array")
      t.equal(result.length, albumIds.length, "Returns correct number of rows")
    })
  })

  t.test("Void query", async (t) => {
    t.test(".createAlbum() returns a new row", async (t) => {
      const result = await AlbumModel.updateAlbum({
        albumId: albums[0].album_id,
        coverArtUrl: "lorem ipsum",
      })
      t.ok(Array.isArray(result) && !result.length, "Returns empty array")
    })
  })
})
