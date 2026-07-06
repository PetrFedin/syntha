export type B2b3dSdkConfig = {
  sdkUrl: string;
  sdkScriptUrl?: string;
  targetOrigin: string;
  bridgeVersion: string;
  handshakeEvent: string;
};

export type B2b3dProviderAdapter = {
  id: 'matterport' | 'generic';
  labelRu: string;
  extraHandshakeEvents?: string[];
  mount?: (input: {
    host: HTMLElement;
    sdkConfig: B2b3dSdkConfig;
    collectionId: string;
    articleId: string;
  }) => void | (() => void);
};
