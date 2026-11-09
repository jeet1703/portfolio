/* The connector stub a device plugs into; the page cable runs past its outer end. */
export default function Jack({ color }) {
  return <span className="jack" aria-hidden="true" style={{ '--jc': color }}><i></i></span>;
}
