import {
  createModel,
  groupWith,
  indexWith,
  mapWith,
  mapWithEntity,
  takeOne,
} from "../../../../src"
import {pool} from "../connection"
import {Album, AlbumWithTracks, Track} from "../../classes"
import * as queries from "./Album.queries"

export const AlbumModel = createModel({
  connection: pool,
  queries: {
    ...queries,
    listTitlesByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: true,
  collectDefault: mapWithEntity(Album),
  collect: {
    listAlbumsWithTracks: groupWith("albumId", (rows) => {
      const tracks = rows.map((row) => new Track(row))
      return new AlbumWithTracks({...rows[0], tracks})
    }),
  },
  onQuery: ({queryName, params, rows, result}) => {
    // console.table([
    //   {
    //     queryName,
    //     params: JSON.stringify(params),
    //     rowCount: rows.length,
    //   },
    // ])
  },
}).extend({
  getAlbum: takeOne(),
  createAlbum: takeOne(),
  listTitlesByArtistId: indexWith(
    "artistId",
    mapWith((album) => album.albumName),
  ),
})
