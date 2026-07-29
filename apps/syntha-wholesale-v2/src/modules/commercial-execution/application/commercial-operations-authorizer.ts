export interface CommercialOperationsAuthorizer {
  authorize(request: Request): Promise<boolean>;
}
