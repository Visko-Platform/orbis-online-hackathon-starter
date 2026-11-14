export const headViews = [
  { id: "front", label: "Front", yaw: 0 },
  { id: "left", label: "Left profile", yaw: -Math.PI / 2 },
  { id: "right", label: "Right profile", yaw: Math.PI / 2 },
  { id: "back", label: "Back", yaw: Math.PI },
] as const;

export type HeadView = typeof headViews[number]["id"];
export type HeadPhotos = Partial<Record<HeadView, Blob>>;
