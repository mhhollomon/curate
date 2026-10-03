export interface respAlbumTrack {
    id : string
    name : string
    sort_name : string
    format : string
    position : number
}

export interface respAlbumArtist {
    id : string
    name : string
    sort_name : string
}

export interface respAlbumAlbum {
    id : string
    name : string
    sort_name : string
    cover : string | null

}