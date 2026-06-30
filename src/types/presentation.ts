export type QuestionPresentation = {
  mode: 'onePerScreen' | 'twoPerScreen' | 'singlePage';
  showProgressBar: boolean;
  behavioralShowSectionHeaders: boolean;
};

export const DEFAULT_PRESENTATION: QuestionPresentation = {
  mode: 'onePerScreen',
  showProgressBar: true,
  behavioralShowSectionHeaders: true,
};
