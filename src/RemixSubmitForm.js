export function renderRemixSubmitForm(artifactId) {
  return `
    <h3>Submit a Remix</h3>
    <form id="remix-form">
      <input type="hidden" name="originalId" value="${artifactId}" />
      <label>Actor:</label>
      <input type="text" name="actor" required />
      <label>New Artifact ID:</label>
      <input type="text" name="newArtifactId" required />
      <button type="submit">Submit Remix</button>
    </form>
    <script>
      document.getElementById("remix-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
          originalId: form.originalId.value,
          actor: form.actor.value,
          newArtifactId: form.newArtifactId.value
        };
        await fetch("/remix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        alert("Remix submitted and immortalized.");
      });
    </script>
  `;
}
