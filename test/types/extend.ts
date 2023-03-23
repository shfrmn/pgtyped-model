import {createModel, QueryFunction} from "../../src"
import {mapKeysToCamelCase} from "../../src/CaseAware"
import {
  Album,
  AlbumWithTracks,
  Track,
  IAlbum,
} from "../../examples/SampleApp/classes"
import {pool} from "../../examples/SampleApp/models/connection"
import * as queries from "../../examples/SampleApp/models/Album/Album.queries"

export namespace ExtendDefaultOnly {
  const snakeCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: false,
    collectDefault: (rows) => {
      return rows.map((row) => {
        return new Album({
          albumId: row.album_id,
          artistId: row.artist_id,
          albumName: row.album_name,
          coverArtUrl: row.cover_art_url,
          releasedAt: row.released_at,
          createdAt: row.created_at,
        })
      })
    },
  }).extend({
    listAlbumsWithTracks: (rows) => rows[0],
  })

  const camelCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: true,
    collectDefault: (rows) => rows.map((row) => new Album(row)),
  }).extend({
    listAlbumsWithTracks: (rows) => rows[0],
  })

  type CollectionQuery<P> = QueryFunction<P, Album[]>
  type JoinQuery = QueryFunction<queries.IListAlbumsWithTracksParams, Album>
  type VoidQuery<P> = QueryFunction<P, []>

  export function test(model: typeof camelCaseModel | typeof snakeCaseModel) {
    const listAlbums: CollectionQuery<queries.IListAlbumsParams> =
      model.listAlbums

    const getAlbum: CollectionQuery<queries.IGetAlbumParams> = model.getAlbum

    const listAlbumsWithTracks: JoinQuery = model.listAlbumsWithTracks

    const createAlbum: CollectionQuery<queries.ICreateAlbumParams> =
      model.createAlbum

    const updateAlbum: VoidQuery<queries.IUpdateAlbumParams> = model.updateAlbum

    const deleteAlbum: VoidQuery<queries.IDeleteAlbumParams> = model.deleteAlbum
  }
}

export namespace ExtendOverrideOnly {
  const snakeCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: false,
    collect: {
      listAlbums: (rows) => rows.map(mapKeysToCamelCase),
      getAlbum: (rows) => rows.map(mapKeysToCamelCase),
      createAlbum: (rows) => rows.map(mapKeysToCamelCase),
      listAlbumsWithTracks: (rows) => rows.map(mapKeysToCamelCase),
    },
  }).extend({
    listAlbumsWithTracks: (rows) => {
      const tracks = rows.map((row) => {
        return new Track({...row, createdAt: row.trackCreatedAt})
      })
      return new AlbumWithTracks({...rows[0], tracks})
    },
  })

  const camelCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: true,
    collect: {
      listAlbumsWithTracks: (rows) => rows,
    },
  }).extend({
    listAlbumsWithTracks: (rows) => {
      const tracks = rows.map((row) => {
        return new Track({...row, createdAt: row.trackCreatedAt})
      })
      return new AlbumWithTracks({...rows[0], tracks})
    },
  })

  type CollectionQuery<P> = QueryFunction<P, IAlbum[]>
  type JoinQuery = QueryFunction<
    queries.IListAlbumsWithTracksParams,
    AlbumWithTracks
  >
  type VoidQuery<P> = QueryFunction<P, []>

  export function test(model: typeof camelCaseModel | typeof snakeCaseModel) {
    const listAlbums: CollectionQuery<queries.IListAlbumsParams> =
      model.listAlbums

    const getAlbum: CollectionQuery<queries.IGetAlbumParams> = model.getAlbum

    const listAlbumsWithTracks: JoinQuery = model.listAlbumsWithTracks

    const createAlbum: CollectionQuery<queries.ICreateAlbumParams> =
      model.createAlbum

    const updateAlbum: VoidQuery<queries.IUpdateAlbumParams> = model.updateAlbum

    const deleteAlbum: VoidQuery<queries.IDeleteAlbumParams> = model.deleteAlbum
  }
}

export namespace ExtendDefaultAndOverride {
  const snakeCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: false,
    collectDefault: (rows) => {
      return rows.map((row) => new Album(mapKeysToCamelCase(row)))
    },
    collect: {
      listAlbumsWithTracks: (rows) => rows.map(mapKeysToCamelCase),
    },
  }).extend({
    listAlbumsWithTracks: (rows) => {
      const tracks = rows.map((row) => {
        return new Track({...row, createdAt: row.trackCreatedAt})
      })
      return new AlbumWithTracks({...rows[0], tracks})
    },
  })

  const camelCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: true,
    collectDefault: (rows) => rows.map((row) => new Album(row)),
    collect: {
      listAlbumsWithTracks: (rows) => rows,
    },
  }).extend({
    listAlbumsWithTracks: (rows) => {
      const tracks = rows.map((row) => {
        return new Track({...row, createdAt: row.trackCreatedAt})
      })
      return new AlbumWithTracks({...rows[0], tracks})
    },
  })

  type CollectionQuery<P> = QueryFunction<P, Album[]>
  type JoinQuery = QueryFunction<
    queries.IListAlbumsWithTracksParams,
    AlbumWithTracks
  >
  type VoidQuery<P> = QueryFunction<P, []>

  export function test(model: typeof camelCaseModel | typeof snakeCaseModel) {
    const listAlbums: CollectionQuery<queries.IListAlbumsParams> =
      model.listAlbums

    const getAlbum: CollectionQuery<queries.IGetAlbumParams> = model.getAlbum

    const listAlbumsWithTracks: JoinQuery = model.listAlbumsWithTracks

    const createAlbum: CollectionQuery<queries.ICreateAlbumParams> =
      model.createAlbum

    const updateAlbum: VoidQuery<queries.IUpdateAlbumParams> = model.updateAlbum

    const deleteAlbum: VoidQuery<queries.IDeleteAlbumParams> = model.deleteAlbum
  }
}
