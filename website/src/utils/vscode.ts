const VS_CODE_AZURE_URL = "https://vscode.dev/azure";

export function getOpenInVSCodeUrl(templateSource: string): string {
  const params = new URLSearchParams({
    "vscode-azure-exp": "azd",
    "az-referer": "awesome-azd",
    azdTemplateUrl: templateSource,
  });

  return `${VS_CODE_AZURE_URL}?${params.toString()}`;
}
