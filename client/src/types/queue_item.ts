
export interface QueueItem {
    track_id : string;
    track_name : string;
    duration? : number;

    artist_id : string;
    artist_name : string;

    album_id? : string;
    album_name? : string;

    cover_id? : string;
}