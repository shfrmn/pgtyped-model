/** Types generated for queries found in "examples/SampleApp/models/Album/Album.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ListAlbums' parameters type */
export interface IListAlbumsParams {
  artistIds: readonly (string)[];
}

/** 'ListAlbums' return type */
export interface IListAlbumsResult {
  album_id: string;
  album_name: string;
  artist_id: string;
  cover_art_url: string;
  created_at: Date;
  id: number;
  released_at: Date;
}

/** 'ListAlbums' query type */
export interface IListAlbumsQuery {
  params: IListAlbumsParams;
  result: IListAlbumsResult;
}

const listAlbumsIR: any = {"usedParamSet":{"artistIds":true},"params":[{"name":"artistIds","required":true,"transform":{"type":"array_spread"},"locs":[{"a":40,"b":50}]}],"statement":"SELECT * FROM albums\nWHERE artist_id IN :artistIds!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM albums
 * WHERE artist_id IN :artistIds!
 * ```
 */
export const listAlbums = new PreparedQuery<IListAlbumsParams,IListAlbumsResult>(listAlbumsIR);


/** 'GetAlbum' parameters type */
export interface IGetAlbumParams {
  albumId: string;
}

/** 'GetAlbum' return type */
export interface IGetAlbumResult {
  album_id: string;
  album_name: string;
  artist_id: string;
  cover_art_url: string;
  created_at: Date;
  id: number;
  released_at: Date;
}

/** 'GetAlbum' query type */
export interface IGetAlbumQuery {
  params: IGetAlbumParams;
  result: IGetAlbumResult;
}

const getAlbumIR: any = {"usedParamSet":{"albumId":true},"params":[{"name":"albumId","required":true,"transform":{"type":"scalar"},"locs":[{"a":38,"b":46}]}],"statement":"SELECT * FROM albums\nWHERE album_id = :albumId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM albums
 * WHERE album_id = :albumId!
 * ```
 */
export const getAlbum = new PreparedQuery<IGetAlbumParams,IGetAlbumResult>(getAlbumIR);


/** 'ListAlbumsWithTracks' parameters type */
export interface IListAlbumsWithTracksParams {
  albumIds: readonly (string)[];
}

/** 'ListAlbumsWithTracks' return type */
export interface IListAlbumsWithTracksResult {
  album_id: string;
  album_name: string;
  artist_id: string;
  cover_art_url: string;
  created_at: Date;
  id: number;
  media_url: string;
  released_at: Date;
  track_created_at: Date;
  track_id: string;
  track_name: string;
}

/** 'ListAlbumsWithTracks' query type */
export interface IListAlbumsWithTracksQuery {
  params: IListAlbumsWithTracksParams;
  result: IListAlbumsWithTracksResult;
}

const listAlbumsWithTracksIR: any = {"usedParamSet":{"albumIds":true},"params":[{"name":"albumIds","required":true,"transform":{"type":"array_spread"},"locs":[{"a":162,"b":171}]}],"statement":"SELECT\n  a.*,\n  t.track_id,\n  t.track_name,\n  t.media_url,\n  t.created_at AS track_created_at\nFROM albums a\nLEFT JOIN tracks t USING (album_id)\nWHERE album_id IN :albumIds!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   a.*,
 *   t.track_id,
 *   t.track_name,
 *   t.media_url,
 *   t.created_at AS track_created_at
 * FROM albums a
 * LEFT JOIN tracks t USING (album_id)
 * WHERE album_id IN :albumIds!
 * ```
 */
export const listAlbumsWithTracks = new PreparedQuery<IListAlbumsWithTracksParams,IListAlbumsWithTracksResult>(listAlbumsWithTracksIR);


/** 'CreateAlbum' parameters type */
export interface ICreateAlbumParams {
  album: {
    artistId: string | null | void,
    albumName: string | null | void,
    coverArtUrl: string | null | void,
    releasedAt: Date | string | null | void
  };
}

/** 'CreateAlbum' return type */
export interface ICreateAlbumResult {
  album_id: string;
  album_name: string;
  artist_id: string;
  cover_art_url: string;
  created_at: Date;
  id: number;
  released_at: Date;
}

/** 'CreateAlbum' query type */
export interface ICreateAlbumQuery {
  params: ICreateAlbumParams;
  result: ICreateAlbumResult;
}

const createAlbumIR: any = {"usedParamSet":{"album":true},"params":[{"name":"album","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"artistId","required":false},{"name":"albumName","required":false},{"name":"coverArtUrl","required":false},{"name":"releasedAt","required":false}]},"locs":[{"a":78,"b":83}]}],"statement":"INSERT INTO albums (artist_id, album_name, cover_art_url, released_at)\nVALUES :album\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO albums (artist_id, album_name, cover_art_url, released_at)
 * VALUES :album
 * RETURNING *
 * ```
 */
export const createAlbum = new PreparedQuery<ICreateAlbumParams,ICreateAlbumResult>(createAlbumIR);


/** 'UpdateAlbum' parameters type */
export interface IUpdateAlbumParams {
  albumId: string;
  coverArtUrl: string;
}

/** 'UpdateAlbum' return type */
export type IUpdateAlbumResult = void;

/** 'UpdateAlbum' query type */
export interface IUpdateAlbumQuery {
  params: IUpdateAlbumParams;
  result: IUpdateAlbumResult;
}

const updateAlbumIR: any = {"usedParamSet":{"coverArtUrl":true,"albumId":true},"params":[{"name":"coverArtUrl","required":true,"transform":{"type":"scalar"},"locs":[{"a":34,"b":46}]},{"name":"albumId","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":73}]}],"statement":"UPDATE albums\nSET cover_art_url = :coverArtUrl!\nWHERE album_id = :albumId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE albums
 * SET cover_art_url = :coverArtUrl!
 * WHERE album_id = :albumId!
 * ```
 */
export const updateAlbum = new PreparedQuery<IUpdateAlbumParams,IUpdateAlbumResult>(updateAlbumIR);


/** 'DeleteAlbum' parameters type */
export interface IDeleteAlbumParams {
  albumId: string;
}

/** 'DeleteAlbum' return type */
export type IDeleteAlbumResult = void;

/** 'DeleteAlbum' query type */
export interface IDeleteAlbumQuery {
  params: IDeleteAlbumParams;
  result: IDeleteAlbumResult;
}

const deleteAlbumIR: any = {"usedParamSet":{"albumId":true},"params":[{"name":"albumId","required":true,"transform":{"type":"scalar"},"locs":[{"a":36,"b":44}]}],"statement":"DELETE FROM albums\nWHERE album_id = :albumId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM albums
 * WHERE album_id = :albumId!
 * ```
 */
export const deleteAlbum = new PreparedQuery<IDeleteAlbumParams,IDeleteAlbumResult>(deleteAlbumIR);


