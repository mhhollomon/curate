
// format a number of seconds into hh::mm::ss
// But only include the hh if it is needed.
// Ignore frational seconds.
//--------------------
export function formatTime(seconds: number) {
    if (isNaN(seconds)) return "00:00"; // Handle unloaded audio
    const secs = Math.floor(seconds % 60);

    let minutes = Math.floor(seconds / 60);
    let hours = 0;
    let hour_str = '';
    if (minutes > 59) {
        hours = Math.floor(minutes/60);
        minutes = minutes % 60;
        hour_str = hours.toString() + ':';
    }
    return `${hour_str}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
