// Text-based wordmark only, matching StackDiligence's current brand direction (no icon mark
// yet — see branding/keystone-systems-brand-guide.md context in the root CLAUDE.md). Not part
// of @keystone/ui since that package's KeystoneLogo is Keystone-specific.
export function StackDiligenceLogo() {
  return <span className="text-xl font-bold tracking-wide text-blueprint-navy">STACKDILIGENCE</span>;
}
