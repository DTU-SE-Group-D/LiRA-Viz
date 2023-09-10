export default function testJSON(meta: string): () => void {
  return () => {
    const json = JSON.stringify(meta);
    JSON.parse(json);
  };
}
