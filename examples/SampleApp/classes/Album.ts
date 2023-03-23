import {Track} from "./Track"

export interface IAlbum {
  albumId: string
  artistId: string
  albumName: string
  coverArtUrl: string
  releasedAt: Date
  createdAt: Date
}

export class Album {
  public albumId: string
  public artistId: string
  public albumName: string
  public coverArtUrl: string
  public releasedAt: Date
  public createdAt: Date
  constructor(data: IAlbum) {
    this.albumId = data.albumId
    this.artistId = data.artistId
    this.albumName = data.albumName
    this.coverArtUrl = data.coverArtUrl
    this.releasedAt = data.releasedAt
    this.createdAt = data.createdAt
  }

  public getNormalizedName(): string {
    return this.albumName
  }
}

export interface IAlbumWithTracks extends IAlbum {
  tracks: Track[]
}

export class AlbumWithTracks extends Album {
  public tracks: Track[]

  constructor(data: IAlbumWithTracks) {
    super(data)
    this.tracks = data.tracks
  }

  public getTrackCount(): number {
    return this.tracks.length
  }
}
