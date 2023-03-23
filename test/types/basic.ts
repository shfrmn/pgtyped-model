import {createModel, QueryFunction} from "../../src"
import {pool} from "../../examples/SampleApp/models/connection"
import {IAlbum, ITrack} from "../../examples/SampleApp/classes"
import * as queries from "../../examples/SampleApp/models/Album/Album.queries"

export namespace BasicSnakeCase {
  const model = createModel({
    connection: pool,
    queries: {
      ...queries,
      listAlbumsByArtistId: queries.listAlbums,
    },
    camelCaseColumnNames: false,
  })

  type AlbumRowQuery<P> = QueryFunction<P, queries.IGetAlbumResult[]>
  type JoinRowQuery = QueryFunction<
    queries.IListAlbumsWithTracksParams,
    queries.IListAlbumsWithTracksResult[]
  >
  type VoidQuery<P> = QueryFunction<P, []>

  export const listAlbums: AlbumRowQuery<queries.IListAlbumsParams> =
    model.listAlbums

  export const getAlbum: AlbumRowQuery<queries.IGetAlbumParams> = model.getAlbum

  export const listAlbumsByArtistId: AlbumRowQuery<queries.IListAlbumsParams> =
    model.listAlbumsByArtistId

  export const listAlbumsWithTracks: JoinRowQuery = model.listAlbumsWithTracks

  export const createAlbum: AlbumRowQuery<queries.ICreateAlbumParams> =
    model.createAlbum

  export const updateAlbum: VoidQuery<queries.IUpdateAlbumParams> =
    model.updateAlbum

  export const deleteAlbum: VoidQuery<queries.IDeleteAlbumParams> =
    model.deleteAlbum
}

export namespace BasicCamelCase {
  const model = createModel({
    connection: pool,
    queries: {
      ...queries,
      listAlbumsByArtistId: queries.listAlbums,
    },
    camelCaseColumnNames: true,
  })

  type CamelCaseQuery<P> = QueryFunction<P, IAlbum[]>
  type CamelCaseJoinQuery = QueryFunction<
    queries.IListAlbumsWithTracksParams,
    (IAlbum & ITrack & {trackCreatedAt: Date})[]
  >
  type VoidQuery<P> = QueryFunction<P, []>

  export const listAlbums: CamelCaseQuery<queries.IListAlbumsParams> =
    model.listAlbums

  export const getAlbum: CamelCaseQuery<queries.IGetAlbumParams> =
    model.getAlbum

  export const listAlbumsByArtistId: CamelCaseQuery<queries.IListAlbumsParams> =
    model.listAlbumsByArtistId

  export const listAlbumsWithTracks: CamelCaseJoinQuery =
    model.listAlbumsWithTracks

  export const createAlbum: CamelCaseQuery<queries.ICreateAlbumParams> =
    model.createAlbum

  export const updateAlbum: VoidQuery<queries.IUpdateAlbumParams> =
    model.updateAlbum

  export const deleteAlbum: VoidQuery<queries.IDeleteAlbumParams> =
    model.deleteAlbum
}
