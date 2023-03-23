import {
  createModel,
  groupWith,
  mapWith,
  nestWith,
  takeOne,
} from "../../../../src"
import {pool} from "../connection"
import {Album, AlbumWithTracks, Track} from "../../classes"
import * as queries from "./Album.queries"

export const AlbumModel = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: true,
  collectDefault: mapWith((row) => new Album(row)),
  collect: {
    listAlbumsWithTracks: nestWith("albumId", (rows) => {
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
  listAlbumsByArtistId: groupWith("artistId"),
})
