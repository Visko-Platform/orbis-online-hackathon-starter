import { isJointId, jointGroups, type JointId } from "@/lib/camera/joints";

type PickerProps = { label: string; value: JointId; onChange: (value: JointId) => void; accessory?: false } |
  { label: string; value?: JointId; onChange: (value?: JointId) => void; accessory: true };

export function JointPicker(props: PickerProps) {
  return <select aria-label={props.label} value={props.value ?? ""} onChange={({ target: { value } }) => {
    if (isJointId(value)) props.onChange(value);
    else if (props.accessory) props.onChange(undefined);
  }}>
    {props.accessory && <option value="">Default placement</option>}
    {jointGroups.map(({ label, joints }) => <optgroup key={label} label={label}>
      {joints.map((joint) => <option key={joint.id} value={joint.id}>{joint.label}</option>)}
    </optgroup>)}
  </select>;
}
