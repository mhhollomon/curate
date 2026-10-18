
export interface CoverImageProps {
    cover_id : string;
}

export default function CoverImage({cover_id} : CoverImageProps) {
    return(<>
        <img src={`/api/cover/thumb/${cover_id}`} width={30} height={30} />
    </>)
}