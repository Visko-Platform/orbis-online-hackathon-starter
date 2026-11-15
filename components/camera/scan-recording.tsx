import { useEffect, useRef, useState, type RefObject } from "react";

export function ScanRecording({ camera, running }: {
  camera: RefObject<HTMLVideoElement | null>;
  running: boolean;
}) {
  const current = useRef<MediaRecorder>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState<{ url: string; extension: string }>();
  const [error, setError] = useState("");

  useEffect(() => () => { if (clip) URL.revokeObjectURL(clip.url); }, [clip]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    const recorder = current.current;
    if (recorder?.state === "recording") {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      recorder.stop();
    }
  }, []);

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    if (current.current?.state === "recording") current.current.stop();
  }

  function record() {
    const video = camera.current;
    const stream = video?.srcObject;
    if (!(stream instanceof MediaStream) || !running || current.current) return;
    setError("");
    try {
      const recorder = new MediaRecorder(new MediaStream(stream.getVideoTracks()), { videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => setError("Couldn’t record the camera orbit.");
      recorder.onstop = () => {
        if (timer.current) clearTimeout(timer.current);
        current.current = null;
        setRecording(false);
        if (!chunks.length) return;
        const mime = recorder.mimeType;
        setClip({ url: URL.createObjectURL(new Blob(chunks, { type: mime })), extension: mime.includes("mp4") ? "mp4" : "webm" });
      };
      recorder.start(1000);
      current.current = recorder;
      setRecording(true);
      timer.current = setTimeout(stop, 45_000);
    } catch {
      setError("This browser couldn’t record the camera orbit.");
    }
  }

  return <>
    <p>Keep your head still while someone circles you with the camera. Include the back, crown, and both profiles.</p>
    <button type="button" disabled={!running && !recording} onClick={recording ? stop : record}>
      {recording ? "Stop recording" : "Record head scan"}
    </button>
    {clip && <> <a href={clip.url} download={`head-orbit.${clip.extension}`}>Download scan video</a>
      {" "}<button type="button" onClick={() => setClip(undefined)}>Delete recording</button></>}
    {error && <p role="alert">{error}</p>}
  </>;
}
