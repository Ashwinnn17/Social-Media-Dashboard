import { C } from "../theme/styles";

export default function ErrMsg({ msg }) {
  return <div style={{ fontSize: 11, color: C.err, padding: "16px 0" }}>{msg}</div>;
}
