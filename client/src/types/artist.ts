export interface Artist {
    id : string;
    name : string;
    sort_name : string;
}

import { type Album } from './album'
import { type Track } from './track'

export interface ArtistWorks {
    artist : Artist
    singles : Track[]
    albums : Album[]

}