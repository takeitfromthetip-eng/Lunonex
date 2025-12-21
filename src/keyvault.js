import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const vaultName = process.env.KEYVAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const client = new SecretClient(url, credential);

export async function getSecret(name) {
  const secret = await client.getSecret(name);
  return secret.value;
}
