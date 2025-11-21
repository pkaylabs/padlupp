const wrapClick = (fn: () => void) => (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  fn();
};

export default wrapClick;
