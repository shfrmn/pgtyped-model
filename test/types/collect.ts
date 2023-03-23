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

export namespace CollectDefaultOnly {
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
  })
  const camelCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: true,
    collectDefault: (rows) => rows.map((row) => new Album(row)),
  })

  type CollectionQuery<P> = QueryFunction<P, Album[]>
  type JoinQuery = QueryFunction<queries.IListAlbumsWithTracksParams, Album[]>
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

export namespace CollectOverrideOnly {
  const snakeCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: false,
    collect: {
      listAlbums: (rows) => rows.map(mapKeysToCamelCase),
      getAlbum: (rows) => rows.map(mapKeysToCamelCase),
      createAlbum: (rows) => rows.map(mapKeysToCamelCase),
      listAlbumsWithTracks: (rows) => {
        const tracks = rows.map((row) => {
          return new Track({
            trackId: row.track_id,
            albumId: row.album_id,
            trackName: row.track_name,
            mediaUrl: row.media_url,
            createdAt: row.track_created_at,
          })
        })
        return new AlbumWithTracks({
          albumId: rows[0].album_id,
          artistId: rows[0].artist_id,
          albumName: rows[0].album_name,
          coverArtUrl: rows[0].cover_art_url,
          releasedAt: rows[0].released_at,
          createdAt: rows[0].created_at,
          tracks,
        })
      },
    },
  })
  const camelCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: true,
    collect: {
      listAlbumsWithTracks: (rows) => {
        const tracks = rows.map((row) => {
          return new Track({...row, createdAt: row.trackCreatedAt})
        })
        return new AlbumWithTracks({...rows[0], tracks})
      },
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

export namespace CollectDefaultAndOverride {
  const snakeCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: false,
    collectDefault: (rows) => {
      return rows.map((row) => new Album(mapKeysToCamelCase(row)))
    },
    collect: {
      listAlbumsWithTracks: (rows) => {
        const tracks = rows.map((row) => {
          return new Track({
            trackId: row.track_id,
            albumId: row.album_id,
            trackName: row.track_name,
            mediaUrl: row.media_url,
            createdAt: row.track_created_at,
          })
        })
        return new AlbumWithTracks({
          albumId: rows[0].album_id,
          artistId: rows[0].artist_id,
          albumName: rows[0].album_name,
          coverArtUrl: rows[0].cover_art_url,
          releasedAt: rows[0].released_at,
          createdAt: rows[0].created_at,
          tracks,
        })
      },
    },
  })
  const camelCaseModel = createModel({
    connection: pool,
    queries,
    camelCaseColumnNames: true,
    collectDefault: (rows) => rows.map((row) => new Album(row)),
    collect: {
      listAlbumsWithTracks: (rows) => {
        const tracks = rows.map((row) => {
          return new Track({...row, createdAt: row.trackCreatedAt})
        })
        return new AlbumWithTracks({...rows[0], tracks})
      },
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
