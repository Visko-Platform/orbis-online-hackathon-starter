// MediaPipe's WASM loader uses importScripts, so this is a classic worker.
const vision = import("/camera/wasm/vision_bundle.mjs").then(async (sdk) => ({
  sdk,
  files: await sdk.FilesetResolver.forVisionTasks(`${self.location.origin}/camera/wasm`),
}));
const models = new Map();
let loading = Promise.resolve();

function load(kind) {
  if (models.has(kind)) return;
  models.set(kind, null);
  loading = loading.then(async () => {
    const { sdk, files } = await vision;
    const options = {
      baseOptions: { modelAssetPath: `/camera-models/${kind}.task` },
      runningMode: "VIDEO",
    };
    let model;
    if (kind === "hand") {
      const handOptions = { ...options, numHands: 2 };
      try {
        model = await sdk.HandLandmarker.createFromOptions(files, {
          ...handOptions, baseOptions: { ...options.baseOptions, delegate: "GPU" },
        });
      } catch {
        model = await sdk.HandLandmarker.createFromOptions(files, handOptions);
      }
    }
    if (kind === "pose") model = await sdk.PoseLandmarker.createFromOptions(files, options);
    if (kind === "face") {
      model = await sdk.FaceLandmarker.createFromOptions(files, {
        ...options, numFaces: 1, outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true,
      });
      const edges = sdk.FaceLandmarker.FACE_LANDMARKS_TESSELATION;
      const triangles = [];
      for (let i = 0; i < edges.length; i += 3) {
        triangles.push([edges[i].start, edges[i].end, edges[i + 1].end]);
      }
      self.postMessage({ type: "triangles", triangles });
    }
    models.set(kind, model);
  }).catch(() => self.postMessage({ type: "error", kind }));
}

load("hand");
self.onmessage = ({ data: { image, time, face, shoulders, hat, garment, fullBody, motion } }) => {
  if (face) load("face");
  if (shoulders || hat || garment || fullBody || motion) load("pose");
  const result = { type: "frame", time, fullBody, motion };
  try {
    for (const kind of ["face", "hand", "pose"]) {
      const model = models.get(kind);
      // Keep the pose model warm at profile angles so it can pick up the rear view.
      const faceForward = result.face?.matrix[10] ?? 0;
      if (!model || (kind === "face" && !face) ||
          (kind === "pose" && !motion && !fullBody && !shoulders && !garment && (!hat || faceForward > 0.55))) continue;
      try {
        const sample = model.detectForVideo(image, time);
        if (kind === "hand") {
          result.hands = sample.landmarks.map((points, index) => ({
            side: sample.handedness[index]?.[0]?.categoryName,
            wrist: points[0], thumb: points[4], tip: points[8], knuckle: points[9],
            ...(fullBody && { points, confidence: sample.handedness[index]?.[0]?.score }),
          }));
        }
        if (kind === "pose" && sample.landmarks[0]) {
          const points = sample.landmarks[0];
          if (fullBody || motion) result.pose = points;
          if (shoulders) result.shoulders = [points[11], points[12], points[23], points[24]];
          const indices = [11, 12, 23, 24, 7, 8];
          const world = sample.worldLandmarks[0];
          if (world && (hat || garment)) {
            result.body = { points: indices.map((i) => points[i]), world: indices.map((i) => world[i]) };
          }
        }
        if (kind === "face" && sample.facialTransformationMatrixes[0]) {
          result.face = {
            points: sample.faceLandmarks[0],
            matrix: sample.facialTransformationMatrixes[0].data,
            expressions: sample.faceBlendshapes[0]?.categories,
          };
        }
      } catch {
        models.set(kind, null);
        model.close();
        self.postMessage({ type: "error", kind });
      }
    }
  } finally {
    image.close();
    self.postMessage(result);
  }
};
