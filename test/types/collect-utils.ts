import {
  createModel,
  groupWith,
  mapWith,
  nestWith,
  takeOne,
  QueryFunction,
} from "../../src"
import {mapKeysToCamelCase} from "../../src/CaseAware"
import {
  Album,
  AlbumWithTracks,
  Track,
  IAlbum,
} from "../../examples/SampleApp/classes"
import {pool} from "../../examples/SampleApp/models/connection"
import * as queries from "../../examples/SampleApp/models/Album/Album.queries"

//
//
//

const snakeCaseDefaultOnly = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: false,
  collectDefault: mapWith((row) => {
    return new Album({
      albumId: row.album_id,
      artistId: row.artist_id,
      albumName: row.album_name,
      coverArtUrl: row.cover_art_url,
      releasedAt: row.released_at,
      createdAt: row.created_at,
    })
  }),
}).extend({
  listAlbumsByArtistId: groupWith("artistId"),
  listAlbumsWithTracks: takeOne(),
})

const camelCaseDefaultOnly = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: true,
  collectDefault: mapWith((row) => new Album(row)),
}).extend({
  listAlbumsByArtistId: groupWith("artistId"),
  listAlbumsWithTracks: takeOne(),
})

const snakeCaseOverrideOnly = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: false,
  collect: {
    listAlbums: mapWith(mapKeysToCamelCase),
    listAlbumsByArtistId: mapWith((row) => new Album(mapKeysToCamelCase(row))),
    getAlbum: mapWith(mapKeysToCamelCase),
    createAlbum: mapWith(mapKeysToCamelCase),
    listAlbumsWithTracks: mapWith(mapKeysToCamelCase),
  },
}).extend({
  listAlbumsByArtistId: groupWith("artistId"),
  listAlbumsWithTracks: nestWith("albumId", (rows) => {
    const tracks = rows.map((row) => {
      return new Track({...row, createdAt: row.trackCreatedAt})
    })
    return new AlbumWithTracks({...rows[0], tracks})
  }),
})

const camelCaseOverrideOnly = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: true,
  collect: {
    listAlbumsByArtistId: mapWith((row) => new Album(row)),
    listAlbumsWithTracks: (rows) => rows,
  },
}).extend({
  listAlbumsByArtistId: groupWith("artistId"),
  listAlbumsWithTracks: nestWith("albumId", (rows) => {
    const tracks = rows.map((row) => {
      return new Track({...row, createdAt: row.trackCreatedAt})
    })
    return new AlbumWithTracks({...rows[0], tracks})
  }),
})

const snakeCaseDefaultAndOverride = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: false,
  collectDefault: mapWith((row) => new Album(mapKeysToCamelCase(row))),
  collect: {
    listAlbumsWithTracks: mapWith(mapKeysToCamelCase),
  },
}).extend({
  listAlbumsByArtistId: groupWith("artistId"),
  listAlbumsWithTracks: nestWith("albumId", (rows) => {
    const tracks = rows.map((row) => {
      return new Track({...row, createdAt: row.trackCreatedAt})
    })
    return new AlbumWithTracks({...rows[0], tracks})
  }),
})

const camelCaseDefaultAndOverride = createModel({
  connection: pool,
  queries: {
    ...queries,
    listAlbumsByArtistId: queries.listAlbums,
  },
  camelCaseColumnNames: true,
  collectDefault: mapWith((row) => new Album(row)),
  collect: {
    listAlbumsWithTracks: (rows) => rows,
  },
}).extend({
  listAlbumsByArtistId: groupWith("artistId"),
  listAlbumsWithTracks: nestWith("albumId", (rows) => {
    const tracks = rows.map((row) => {
      return new Track({...row, createdAt: row.trackCreatedAt})
    })
    return new AlbumWithTracks({...rows[0], tracks})
  }),
})

//
//
//

type AllModels =
  | typeof snakeCaseDefaultOnly
  | typeof camelCaseDefaultOnly
  | typeof snakeCaseOverrideOnly
  | typeof camelCaseOverrideOnly
  | typeof snakeCaseDefaultAndOverride
  | typeof camelCaseDefaultAndOverride

type CollectionQuery<P> = QueryFunction<P, IAlbum[]>
type JoinQuery = QueryFunction<
  queries.IListAlbumsWithTracksParams,
  AlbumWithTracks[]
>
type GroupQuery = QueryFunction<
  queries.IListAlbumsParams,
  Record<string, Album[]>
>
type VoidQuery<P> = QueryFunction<P, []>

export function test(model: AllModels) {
  const listAlbums: CollectionQuery<queries.IListAlbumsParams> =
    model.listAlbums

  const getAlbum: CollectionQuery<queries.IGetAlbumParams> = model.getAlbum

  const listAlbumsByArtistId: GroupQuery = model.listAlbumsByArtistId

  const listAlbumsWithTracks: JoinQuery = model.listAlbumsWithTracks

  const createAlbum: CollectionQuery<queries.ICreateAlbumParams> =
    model.createAlbum

  const updateAlbum: VoidQuery<queries.IUpdateAlbumParams> = model.updateAlbum

  const deleteAlbum: VoidQuery<queries.IDeleteAlbumParams> = model.deleteAlbum
}
