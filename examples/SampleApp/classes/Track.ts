export interface ITrack {
  trackId: string
  albumId: string
  trackName: string
  mediaUrl: string
  createdAt: Date
}

export class Track {
  public trackId: string
  public albumId: string
  public trackName: string
  public mediaUrl: string
  public createdAt: Date
  constructor(data: ITrack) {
    this.trackId = data.trackId
    this.albumId = data.albumId
    this.trackName = data.trackName
    this.mediaUrl = data.mediaUrl
    this.createdAt = data.createdAt
  }

  public getNormalizedName(): string {
    return this.trackName
  }
}
