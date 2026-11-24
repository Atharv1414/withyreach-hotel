export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': null, // BEM: block__element--modifier
    'no-descending-specificity': null,
    'scss/dollar-variable-empty-line-before': null,
    'declaration-empty-line-before': null,
    'declaration-block-single-line-max-declarations': null,
  },
}
